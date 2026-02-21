import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface BroadcastRequest {
  templateId: string;
  audience: "all" | "donors" | "waitlist" | "investors";
  tierFilter?: string;
  scheduleAt?: string; // ISO date string for scheduling
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify admin authorization
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid token" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Check admin role
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .single();

    if (!roleData) {
      return new Response(
        JSON.stringify({ error: "Not authorized" }),
        { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const body: BroadcastRequest = await req.json();
    const { templateId, audience, tierFilter, scheduleAt } = body;

    if (!templateId || !audience) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: templateId and audience" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Verify template exists
    const { data: template, error: templateError } = await supabase
      .from("email_templates")
      .select("*")
      .eq("id", templateId)
      .eq("is_active", true)
      .single();

    if (templateError || !template) {
      return new Response(
        JSON.stringify({ error: "Template not found or inactive" }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Build recipient list based on audience
    const recipients: Array<{ id: string; email: string; name: string; type: string; tier?: string }> = [];

    // Get donors
    if (audience === "all" || audience === "donors") {
      let donorsQuery = supabase.from("donors").select("id, email, name, tier");
      if (tierFilter) {
        donorsQuery = donorsQuery.eq("tier", tierFilter);
      }
      const { data: donors } = await donorsQuery;
      if (donors) {
        recipients.push(...donors.map(d => ({ 
          id: d.id, 
          email: d.email, 
          name: d.name, 
          type: "donor",
          tier: d.tier 
        })));
      }
    }

    // Get waitlist
    if (audience === "all" || audience === "waitlist") {
      let waitlistQuery = supabase.from("waitlist").select("id, email, name, tier, category");
      if (tierFilter) {
        waitlistQuery = waitlistQuery.eq("tier", tierFilter);
      }
      const { data: waitlist } = await waitlistQuery;
      if (waitlist) {
        recipients.push(...waitlist.map(w => ({ 
          id: w.id, 
          email: w.email, 
          name: w.name || "Friend", 
          type: "waitlist",
          tier: w.tier || undefined 
        })));
      }
    }

    // Get investors only
    if (audience === "investors") {
      const { data: investors } = await supabase
        .from("waitlist")
        .select("id, email, name, tier")
        .eq("category", "investor");
      if (investors) {
        recipients.push(...investors.map(i => ({ 
          id: i.id, 
          email: i.email, 
          name: i.name || "Investor", 
          type: "waitlist",
          tier: i.tier || undefined 
        })));
      }
    }

    if (recipients.length === 0) {
      return new Response(
        JSON.stringify({ message: "No recipients found for this audience", queued: 0 }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Deduplicate by email
    const uniqueRecipients = Array.from(
      new Map(recipients.map(r => [r.email, r])).values()
    );

    // Create queue entries
    const scheduledTime = scheduleAt ? new Date(scheduleAt) : new Date();
    const queueEntries = uniqueRecipients.map(recipient => ({
      recipient_email: recipient.email,
      recipient_name: recipient.name,
      recipient_id: recipient.id,
      recipient_type: recipient.type,
      template_id: templateId,
      scheduled_at: scheduledTime.toISOString(),
      status: "pending",
      metadata: {
        broadcastId: `broadcast_${Date.now()}`,
        audience,
        tierFilter,
        tier: recipient.tier,
      },
    }));

    // Insert into queue
    const { data: inserted, error: insertError } = await supabase
      .from("email_queue")
      .insert(queueEntries)
      .select();

    if (insertError) throw insertError;

    return new Response(
      JSON.stringify({
        message: "Broadcast queued successfully",
        templateName: template.name,
        audience,
        tierFilter: tierFilter || "all",
        scheduledAt: scheduledTime.toISOString(),
        queued: inserted?.length || 0,
        recipients: uniqueRecipients.length,
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error sending broadcast:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
