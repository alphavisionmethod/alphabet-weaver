import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { trigger_type, contact_id, contact_email, contact_name, metadata } =
      await req.json();

    if (!trigger_type) {
      return new Response(
        JSON.stringify({ error: "trigger_type is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Find active workflows matching this trigger
    const { data: triggers, error: triggerError } = await supabase
      .from("workflow_triggers")
      .select("workflow_id, trigger_config")
      .eq("trigger_type", trigger_type);

    if (triggerError) throw triggerError;

    if (!triggers || triggers.length === 0) {
      return new Response(
        JSON.stringify({ message: "No workflows match this trigger", executions: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get active workflows
    const workflowIds = triggers.map((t: any) => t.workflow_id);
    const { data: workflows } = await supabase
      .from("workflows")
      .select("id")
      .in("id", workflowIds)
      .eq("is_active", true);

    if (!workflows || workflows.length === 0) {
      return new Response(
        JSON.stringify({ message: "No active workflows for this trigger", executions: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const results = [];

    for (const workflow of workflows) {
      // Create execution record
      const { data: execution, error: execError } = await supabase
        .from("workflow_executions")
        .insert({
          workflow_id: workflow.id,
          contact_id: contact_id || null,
          contact_email: contact_email || null,
          status: "running",
        })
        .select()
        .single();

      if (execError) {
        console.error("Execution create error:", execError);
        continue;
      }

      // Get actions ordered
      const { data: actions } = await supabase
        .from("workflow_actions")
        .select("*")
        .eq("workflow_id", workflow.id)
        .is("parent_action_id", null)
        .order("action_order");

      if (!actions || actions.length === 0) {
        await supabase
          .from("workflow_executions")
          .update({ status: "completed", completed_at: new Date().toISOString() })
          .eq("id", execution.id);
        continue;
      }

      let executionStatus = "completed";

      for (const action of actions) {
        try {
          const result = await executeAction(supabase, action, {
            contact_id,
            contact_email,
            contact_name,
            metadata,
          });

          await supabase.from("workflow_execution_steps").insert({
            execution_id: execution.id,
            action_id: action.id,
            status: "completed",
            executed_at: new Date().toISOString(),
            result,
          });

          // Handle if/else branching
          if (action.action_type === "if_else") {
            const branch = result?.condition_met ? "yes" : "no";
            const { data: branchActions } = await supabase
              .from("workflow_actions")
              .select("*")
              .eq("parent_action_id", action.id)
              .eq("branch", branch)
              .order("action_order");

            if (branchActions) {
              for (const branchAction of branchActions) {
                const branchResult = await executeAction(supabase, branchAction, {
                  contact_id,
                  contact_email,
                  contact_name,
                  metadata,
                });
                await supabase.from("workflow_execution_steps").insert({
                  execution_id: execution.id,
                  action_id: branchAction.id,
                  status: "completed",
                  executed_at: new Date().toISOString(),
                  result: branchResult,
                });
              }
            }
          }
        } catch (err: any) {
          console.error(`Action ${action.id} failed:`, err);
          await supabase.from("workflow_execution_steps").insert({
            execution_id: execution.id,
            action_id: action.id,
            status: "failed",
            executed_at: new Date().toISOString(),
            error: err.message,
          });
          executionStatus = "failed";
        }
      }

      await supabase
        .from("workflow_executions")
        .update({ status: executionStatus, completed_at: new Date().toISOString() })
        .eq("id", execution.id);

      results.push({ workflow_id: workflow.id, execution_id: execution.id, status: executionStatus });
    }

    return new Response(
      JSON.stringify({ executions: results.length, results }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("Execute workflow error:", err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function executeAction(
  supabase: any,
  action: any,
  context: { contact_id?: string; contact_email?: string; contact_name?: string; metadata?: any }
) {
  const config = action.action_config || {};

  switch (action.action_type) {
    case "send_email": {
      if (!config.template_id || !context.contact_email) {
        return { skipped: true, reason: "Missing template or email" };
      }
      const { error } = await supabase.from("email_queue").insert({
        recipient_email: context.contact_email,
        recipient_name: context.contact_name || null,
        recipient_id: context.contact_id || null,
        template_id: config.template_id,
        status: "pending",
        metadata: { workflow_action_id: action.id, ...context.metadata },
      });
      if (error) throw error;
      return { queued: true };
    }

    case "wait_delay": {
      // For now, we log the delay but continue (real implementation would schedule)
      return { delay_hours: config.delay_hours || 0, note: "Delay logged, continuing" };
    }

    case "add_tag": {
      // Update contact metadata with tag
      if (context.contact_id && config.tag_name) {
        // Try waitlist first, then donors
        await supabase
          .from("waitlist")
          .update({ category: config.tag_name })
          .eq("id", context.contact_id);
      }
      return { tag_added: config.tag_name };
    }

    case "remove_tag": {
      if (context.contact_id) {
        await supabase
          .from("waitlist")
          .update({ category: null })
          .eq("id", context.contact_id);
      }
      return { tag_removed: config.tag_name };
    }

    case "update_contact": {
      if (context.contact_id && config.field && config.value) {
        await supabase
          .from("waitlist")
          .update({ [config.field]: config.value })
          .eq("id", context.contact_id);
      }
      return { field: config.field, value: config.value };
    }

    case "if_else": {
      // Evaluate condition
      let conditionMet = false;
      if (context.contact_id && config.condition_field) {
        const { data } = await supabase
          .from("waitlist")
          .select(config.condition_field)
          .eq("id", context.contact_id)
          .maybeSingle();

        if (data) {
          const fieldValue = data[config.condition_field] || "";
          switch (config.condition_operator) {
            case "equals": conditionMet = fieldValue === config.condition_value; break;
            case "not_equals": conditionMet = fieldValue !== config.condition_value; break;
            case "contains": conditionMet = String(fieldValue).includes(config.condition_value || ""); break;
            case "not_contains": conditionMet = !String(fieldValue).includes(config.condition_value || ""); break;
            case "is_empty": conditionMet = !fieldValue; break;
            case "is_not_empty": conditionMet = !!fieldValue; break;
          }
        }
      }
      return { condition_met: conditionMet };
    }

    case "webhook": {
      if (!config.webhook_url) return { skipped: true, reason: "No URL" };
      const resp = await fetch(config.webhook_url, {
        method: config.method || "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contact_id: context.contact_id,
          contact_email: context.contact_email,
          contact_name: context.contact_name,
          metadata: context.metadata,
          timestamp: new Date().toISOString(),
          ...(config.body ? JSON.parse(config.body) : {}),
        }),
      });
      return { status: resp.status, ok: resp.ok };
    }

    case "internal_notification": {
      if (config.notify_email) {
        await supabase.from("email_queue").insert({
          recipient_email: config.notify_email,
          recipient_name: "Admin",
          status: "pending",
          metadata: {
            type: "internal_notification",
            message: config.message || "Workflow notification",
            contact_email: context.contact_email,
          },
        });
      }
      return { notified: config.notify_email };
    }

    default:
      return { skipped: true, reason: `Unknown action type: ${action.action_type}` };
  }
}
