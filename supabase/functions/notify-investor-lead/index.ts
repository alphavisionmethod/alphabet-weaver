import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface InvestorLeadRequest {
  email: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const adminEmail = Deno.env.get("ADMIN_EMAIL");

    if (!resendApiKey || !adminEmail) {
      console.log("Missing RESEND_API_KEY or ADMIN_EMAIL - skipping notification");
      return new Response(
        JSON.stringify({ success: true, message: "Notification skipped - secrets not configured" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const { email }: InvestorLeadRequest = await req.json();

    if (!email) {
      throw new Error("Missing email field");
    }

    const resend = new Resend(resendApiKey);

    const emailResponse = await resend.emails.send({
      from: "SITA OS <noreply@resend.dev>",
      to: [adminEmail],
      subject: "🔔 New Investor Lead - SITA OS",
      html: `
        <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <h1 style="color: #1a1a1a; font-size: 24px; margin-bottom: 24px;">New Investor Lead</h1>
          <p style="color: #4a4a4a; font-size: 16px; line-height: 1.6;">
            A new investor has requested access to the data room:
          </p>
          <div style="background: #f5f5f5; border-radius: 8px; padding: 20px; margin: 24px 0;">
            <p style="margin: 0; color: #1a1a1a; font-size: 18px; font-weight: 600;">${email}</p>
          </div>
          <p style="color: #6a6a6a; font-size: 14px;">
            This lead was captured from the Investor Data Room section on the SITA OS landing page.
          </p>
        </div>
      `,
    });

    console.log("Investor notification sent:", emailResponse);

    return new Response(
      JSON.stringify({ success: true, data: emailResponse }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error sending investor notification:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
