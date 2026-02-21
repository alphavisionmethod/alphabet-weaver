import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

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

    // Get email queue stats
    const { data: queueStats, error: queueError } = await supabase
      .from("email_queue")
      .select("status, created_at");

    if (queueError) throw queueError;

    // Get email logs for engagement metrics
    const { data: emailLogs, error: logsError } = await supabase
      .from("email_logs")
      .select("status, opened_at, clicked_at, bounced_at, created_at");

    if (logsError) throw logsError;

    // Get sequences with their performance
    const { data: sequences, error: seqError } = await supabase
      .from("email_sequences")
      .select(`
        id, name, is_active, trigger_type, audience,
        sequence_steps (id)
      `);

    if (seqError) throw seqError;

    // Get templates
    const { data: templates, error: tempError } = await supabase
      .from("email_templates")
      .select("id, name, category, is_active");

    if (tempError) throw tempError;

    // Calculate metrics
    const now = new Date();
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const totalSent = queueStats?.filter(q => q.status === "sent").length || 0;
    const totalPending = queueStats?.filter(q => q.status === "pending").length || 0;
    const totalFailed = queueStats?.filter(q => q.status === "failed").length || 0;

    const sentLast7Days = queueStats?.filter(
      q => q.status === "sent" && new Date(q.created_at) >= last7Days
    ).length || 0;

    const sentLast30Days = queueStats?.filter(
      q => q.status === "sent" && new Date(q.created_at) >= last30Days
    ).length || 0;

    const totalOpened = emailLogs?.filter(l => l.opened_at).length || 0;
    const totalClicked = emailLogs?.filter(l => l.clicked_at).length || 0;
    const totalBounced = emailLogs?.filter(l => l.bounced_at).length || 0;

    const openRate = totalSent > 0 ? ((totalOpened / totalSent) * 100).toFixed(1) : "0.0";
    const clickRate = totalOpened > 0 ? ((totalClicked / totalOpened) * 100).toFixed(1) : "0.0";
    const bounceRate = totalSent > 0 ? ((totalBounced / totalSent) * 100).toFixed(1) : "0.0";

    // Daily breakdown for last 7 days
    const dailyStats = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split("T")[0];
      
      const daySent = queueStats?.filter(q => {
        const qDate = new Date(q.created_at).toISOString().split("T")[0];
        return qDate === dateStr && q.status === "sent";
      }).length || 0;

      const dayOpened = emailLogs?.filter(l => {
        if (!l.opened_at) return false;
        const lDate = new Date(l.opened_at).toISOString().split("T")[0];
        return lDate === dateStr;
      }).length || 0;

      dailyStats.push({
        date: dateStr,
        sent: daySent,
        opened: dayOpened,
      });
    }

    return new Response(
      JSON.stringify({
        overview: {
          totalSent,
          totalPending,
          totalFailed,
          sentLast7Days,
          sentLast30Days,
        },
        engagement: {
          opened: totalOpened,
          clicked: totalClicked,
          bounced: totalBounced,
          openRate: parseFloat(openRate),
          clickRate: parseFloat(clickRate),
          bounceRate: parseFloat(bounceRate),
        },
        sequences: {
          total: sequences?.length || 0,
          active: sequences?.filter(s => s.is_active).length || 0,
          list: sequences?.map(s => ({
            id: s.id,
            name: s.name,
            isActive: s.is_active,
            triggerType: s.trigger_type,
            audience: s.audience,
            steps: s.sequence_steps?.length || 0,
          })) || [],
        },
        templates: {
          total: templates?.length || 0,
          active: templates?.filter(t => t.is_active).length || 0,
          list: templates || [],
        },
        dailyStats,
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error fetching email analytics:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
