import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@4.1.2";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Replace template variables with actual values
const renderTemplate = (html: string, metadata: Record<string, any>): string => {
  let rendered = html;
  
  // Standard system variables
  const variables: Record<string, string> = {
    name: metadata.name || "Valued Member",
    firstName: metadata.name?.split(" ")[0] || "Friend",
    lastName: metadata.name?.split(" ").slice(1).join(" ") || "",
    tier: metadata.tier || "member",
    tierName: metadata.tier ? metadata.tier.charAt(0).toUpperCase() + metadata.tier.slice(1) : "Member",
    backerNumber: metadata.backerNumber ? String(metadata.backerNumber).padStart(4, "0") : "0001",
    email: metadata.email || "",
    amount: metadata.amount ? `$${metadata.amount.toLocaleString()}` : "$0",
    date: new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
    year: new Date().getFullYear().toString(),
    phone: metadata.phone || "",
    company: metadata.company || "SITA",
    companyEmail: metadata.companyEmail || "hello@sita.ai",
    companyPhone: metadata.companyPhone || "+1 800-SITA",
    siteUrl: metadata.siteUrl || "https://sita.ai",
    unsubscribeUrl: metadata.unsubscribeUrl || "#unsubscribe",
    referralCode: metadata.referralCode || "",
    customerId: metadata.customerId || "",
  };

  // Merge any custom variables from metadata
  if (metadata.customVariables && typeof metadata.customVariables === "object") {
    for (const [key, value] of Object.entries(metadata.customVariables)) {
      variables[key] = String(value);
    }
  }

  // Also check for any other metadata fields that might be custom variables
  for (const [key, value] of Object.entries(metadata)) {
    if (!(key in variables) && typeof value === "string") {
      variables[key] = value;
    }
  }

  for (const [key, value] of Object.entries(variables)) {
    rendered = rendered.replace(new RegExp(`{{${key}}}`, "g"), String(value));
  }

  return rendered;
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Optional: Verify authorization for manual triggers
    const authHeader = req.headers.get("Authorization");
    let isManualTrigger = false;
    
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data: { user } } = await supabase.auth.getUser(token);
      
      if (user) {
        const { data: roleData } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .eq("role", "admin")
          .single();
        
        isManualTrigger = !!roleData;
      }
    }

    // Get pending emails that are due
    const { data: pendingEmails, error: fetchError } = await supabase
      .from("email_queue")
      .select(`
        *,
        email_templates (id, name, subject, html_content)
      `)
      .eq("status", "pending")
      .lte("scheduled_at", new Date().toISOString())
      .order("scheduled_at", { ascending: true })
      .limit(50); // Process 50 at a time

    if (fetchError) throw fetchError;

    if (!pendingEmails || pendingEmails.length === 0) {
      return new Response(
        JSON.stringify({ message: "No pending emails to process", processed: 0 }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (!resendApiKey) {
      // Mark emails as failed if no API key
      await supabase
        .from("email_queue")
        .update({ 
          status: "failed", 
          error_message: "RESEND_API_KEY not configured" 
        })
        .in("id", pendingEmails.map(e => e.id));

      return new Response(
        JSON.stringify({ error: "RESEND_API_KEY not configured" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const resend = new Resend(resendApiKey);
    const results = [];

    for (const email of pendingEmails) {
      try {
        // Get template content
        const template = email.email_templates;
        if (!template) {
          throw new Error("Template not found");
        }

        // Render template with metadata
        const metadata = email.metadata || {};
        metadata.name = email.recipient_name;
        metadata.email = email.recipient_email;
        
        const renderedHtml = renderTemplate(template.html_content, metadata);
        const renderedSubject = renderTemplate(template.subject, metadata);

        // Send email via Resend
        const emailResponse = await resend.emails.send({
          from: "SITA <welcome@sita.ai>",
          to: [email.recipient_email],
          subject: renderedSubject,
          html: renderedHtml,
        });

        // Update queue status
        await supabase
          .from("email_queue")
          .update({ 
            status: "sent", 
            sent_at: new Date().toISOString(),
            error_message: null
          })
          .eq("id", email.id);

        // Create log entry
        await supabase
          .from("email_logs")
          .insert({
            queue_id: email.id,
            recipient_email: email.recipient_email,
            recipient_id: email.recipient_id,
            recipient_type: email.recipient_type,
            template_id: template.id,
            sequence_id: email.sequence_id,
            resend_email_id: emailResponse.id,
            status: "sent",
          });

        // Update donor/waitlist email tracking if applicable
        if (email.recipient_type === "donor" && email.recipient_id) {
          await supabase
            .from("donors")
            .update({
              last_email_sent_at: new Date().toISOString(),
              email_sequence_step: (email.step_order || 0) + 1,
              welcome_email_sent: email.step_order === 0 || email.step_order === 1,
            })
            .eq("id", email.recipient_id);
        } else if (email.recipient_type === "waitlist" && email.recipient_id) {
          await supabase
            .from("waitlist")
            .update({
              last_email_sent_at: new Date().toISOString(),
              email_sequence_step: (email.step_order || 0) + 1,
              welcome_email_sent: email.step_order === 0 || email.step_order === 1,
            })
            .eq("id", email.recipient_id);
        }

        results.push({ 
          id: email.id, 
          email: email.recipient_email, 
          status: "sent",
          resendId: emailResponse.id 
        });
      } catch (emailError: any) {
        console.error(`Failed to send email ${email.id}:`, emailError);
        
        // Update queue with error
        await supabase
          .from("email_queue")
          .update({ 
            status: "failed", 
            error_message: emailError.message 
          })
          .eq("id", email.id);

        // Log the failure
        await supabase
          .from("email_logs")
          .insert({
            queue_id: email.id,
            recipient_email: email.recipient_email,
            recipient_id: email.recipient_id,
            recipient_type: email.recipient_type,
            template_id: email.template_id,
            sequence_id: email.sequence_id,
            status: "failed",
          });

        results.push({ 
          id: email.id, 
          email: email.recipient_email, 
          status: "failed", 
          error: emailError.message 
        });
      }
    }

    const successCount = results.filter(r => r.status === "sent").length;
    const failedCount = results.filter(r => r.status === "failed").length;

    return new Response(
      JSON.stringify({ 
        message: "Email queue processed",
        processed: results.length,
        sent: successCount,
        failed: failedCount,
        results 
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error processing email queue:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
