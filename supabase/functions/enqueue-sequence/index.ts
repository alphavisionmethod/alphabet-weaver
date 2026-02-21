import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface EnqueueRequest {
  recipientId: string;
  recipientEmail: string;
  recipientName: string;
  recipientType: "donor" | "waitlist";
  sequenceId?: string;
  triggerType?: "on_signup" | "on_backer" | "manual";
  tier?: string;
  metadata?: Record<string, any>;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body: EnqueueRequest = await req.json();
    const { 
      recipientId, 
      recipientEmail, 
      recipientName, 
      recipientType, 
      sequenceId, 
      triggerType,
      tier,
      metadata = {} 
    } = body;

    if (!recipientEmail || !recipientType) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    let sequence;

    // If specific sequence provided, use it
    if (sequenceId) {
      const { data, error } = await supabase
        .from("email_sequences")
        .select("*")
        .eq("id", sequenceId)
        .eq("is_active", true)
        .single();

      if (error || !data) {
        return new Response(
          JSON.stringify({ error: "Sequence not found or inactive" }),
          { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
      sequence = data;
    } 
    // Otherwise find matching sequence by trigger type
    else if (triggerType) {
      let query = supabase
        .from("email_sequences")
        .select("*")
        .eq("trigger_type", triggerType)
        .eq("is_active", true);

      // Filter by audience
      if (recipientType === "donor") {
        query = query.or("audience.eq.donors,audience.eq.all");
      } else {
        query = query.or("audience.eq.waitlist,audience.eq.all");
      }

      // Filter by tier if applicable
      if (tier) {
        query = query.or(`tier_filter.is.null,tier_filter.eq.${tier}`);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      // Use the first matching sequence
      sequence = data?.[0];
    }

    if (!sequence) {
      return new Response(
        JSON.stringify({ message: "No matching sequence found", queued: 0 }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Get sequence steps
    const { data: steps, error: stepsError } = await supabase
      .from("sequence_steps")
      .select("*, email_templates (*)")
      .eq("sequence_id", sequence.id)
      .order("step_order", { ascending: true });

    if (stepsError) throw stepsError;

    if (!steps || steps.length === 0) {
      return new Response(
        JSON.stringify({ message: "Sequence has no steps", queued: 0 }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Calculate scheduled times and create queue entries
    const now = new Date();
    const queueEntries = steps.map((step, index) => {
      const scheduledAt = new Date(now.getTime() + step.delay_hours * 60 * 60 * 1000);
      
      return {
        recipient_email: recipientEmail,
        recipient_name: recipientName,
        recipient_id: recipientId,
        recipient_type: recipientType,
        template_id: step.template_id,
        sequence_id: sequence.id,
        step_order: step.step_order,
        scheduled_at: scheduledAt.toISOString(),
        status: "pending",
        metadata: {
          ...metadata,
          tier,
          sequenceName: sequence.name,
          stepName: step.email_templates?.name,
        },
      };
    });

    // Insert queue entries
    const { data: inserted, error: insertError } = await supabase
      .from("email_queue")
      .insert(queueEntries)
      .select();

    if (insertError) throw insertError;

    return new Response(
      JSON.stringify({ 
        message: "Sequence queued successfully",
        sequenceId: sequence.id,
        sequenceName: sequence.name,
        queued: inserted?.length || 0,
        steps: steps.map(s => ({
          order: s.step_order,
          template: s.email_templates?.name,
          delayHours: s.delay_hours,
        })),
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error enqueuing sequence:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
