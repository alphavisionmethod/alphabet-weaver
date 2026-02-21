import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Verify user token
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

    // Get all donors who haven't received welcome email
    const { data: donors, error: fetchError } = await supabase
      .from("donors")
      .select("*")
      .eq("welcome_email_sent", false)
      .order("created_at", { ascending: true });

    if (fetchError) throw fetchError;

    if (!donors || donors.length === 0) {
      return new Response(
        JSON.stringify({ message: "No pending welcome emails" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const results = [];

    for (const donor of donors) {
      try {
        // Find the matching sequence for this donor's tier
        const { data: sequence } = await supabase
          .from("email_sequences")
          .select("id")
          .eq("audience", "donors")
          .eq("trigger_type", "on_signup")
          .eq("tier_filter", donor.tier)
          .eq("is_active", true)
          .single();

        if (sequence) {
          // Enqueue the sequence for this donor
          const enqueueResponse = await fetch(`${supabaseUrl}/functions/v1/enqueue-sequence`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${supabaseServiceKey}`,
            },
            body: JSON.stringify({
              sequence_id: sequence.id,
              recipient_id: donor.id,
              recipient_type: "donor",
              recipient_email: donor.email,
              recipient_name: donor.name,
              metadata: {
                tier: donor.tier,
              },
            }),
          });

          if (enqueueResponse.ok) {
            // Mark as welcome email sent
            await supabase
              .from("donors")
              .update({
                welcome_email_sent: true,
                email_sequence_step: 1,
              })
              .eq("id", donor.id);

            results.push({ email: donor.email, status: "enqueued", tier: donor.tier });
          } else {
            const error = await enqueueResponse.text();
            results.push({ email: donor.email, status: "failed", error });
          }
        } else {
          // No matching sequence found, use legacy direct send
          const resendApiKey = Deno.env.get("RESEND_API_KEY");
          if (!resendApiKey) {
            results.push({ email: donor.email, status: "failed", error: "RESEND_API_KEY not configured" });
            continue;
          }

          // Get the template directly
          const { data: template } = await supabase
            .from("email_templates")
            .select("*")
            .eq("category", "welcome")
            .eq("tier_specific", donor.tier)
            .eq("is_active", true)
            .single();

          if (!template) {
            results.push({ email: donor.email, status: "failed", error: "No template found" });
            continue;
          }

          // Calculate backer number
          const { count: backerPosition } = await supabase
            .from("donors")
            .select("*", { count: "exact", head: true })
            .lte("created_at", donor.created_at);

          const backerNumber = backerPosition || 1;

          // Replace variables in template
          const htmlContent = template.html_content
            .replace(/\{\{name\}\}/g, donor.name)
            .replace(/\{\{tier\}\}/g, donor.tier)
            .replace(/\{\{backerNumber\}\}/g, String(backerNumber).padStart(4, "0"));

          const subject = template.subject
            .replace(/\{\{name\}\}/g, donor.name)
            .replace(/\{\{tier\}\}/g, donor.tier);

          const resend = new Resend(resendApiKey);
          const emailResponse = await resend.emails.send({
            from: "SITA <welcome@sita.ai>",
            to: [donor.email],
            subject,
            html: htmlContent,
          });

          // Log the email
          await supabase.from("email_logs").insert({
            recipient_email: donor.email,
            recipient_id: donor.id,
            recipient_type: "donor",
            template_id: template.id,
            status: "sent",
            resend_email_id: emailResponse.data?.id,
          });

          // Mark as sent
          await supabase
            .from("donors")
            .update({
              welcome_email_sent: true,
              last_email_sent_at: new Date().toISOString(),
              email_sequence_step: 1,
            })
            .eq("id", donor.id);

          results.push({ email: donor.email, status: "sent", id: emailResponse.data?.id });
        }
      } catch (emailError: any) {
        console.error(`Failed to process ${donor.email}:`, emailError);
        results.push({ email: donor.email, status: "failed", error: emailError.message });
      }
    }

    return new Response(
      JSON.stringify({ message: "Welcome emails processed", results }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in send-backer-welcome:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
