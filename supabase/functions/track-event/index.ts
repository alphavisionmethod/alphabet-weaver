import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const body = await req.json();
    const { event_type, lead_id, payload } = body;

    if (!event_type) {
      return new Response(JSON.stringify({ error: "event_type required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Insert event
    const { data: event, error } = await supabase
      .from("events")
      .insert({ event_type, lead_id: lead_id || null, payload: payload || null })
      .select()
      .single();

    if (error) throw error;

    // Auto-enroll in workflows on specific events
    if (["WAITLIST_SIGNUP", "DONATION_CREATED", "INVESTOR_INFO_REQUEST"].includes(event_type) && lead_id) {
      // Get lead type
      const { data: lead } = await supabase
        .from("user_leads")
        .select("lead_type")
        .eq("id", lead_id)
        .single();

      if (lead) {
        // Find active workflows for this audience
        const { data: workflows } = await supabase
          .from("workflow_templates")
          .select("id")
          .eq("audience_type", lead.lead_type)
          .in("status", ["SHADOW", "LIVE"]);

        if (workflows?.length) {
          // Check not already enrolled
          const { data: existing } = await supabase
            .from("workflow_enrollments")
            .select("id")
            .eq("lead_id", lead_id)
            .in("workflow_template_id", workflows.map(w => w.id))
            .eq("status", "active");

          const alreadyEnrolled = new Set(existing?.map(e => e.id) || []);
          const newEnrollments = workflows
            .filter(w => !alreadyEnrolled.has(w.id))
            .map(w => ({
              lead_id,
              workflow_template_id: w.id,
              status: "active",
              current_step: 0,
            }));

          if (newEnrollments.length) {
            await supabase.from("workflow_enrollments").insert(newEnrollments);
          }
        }
      }
    }

    return new Response(JSON.stringify({ event }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
