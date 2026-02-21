import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Tier benefits for email content
const tierBenefits: Record<string, { color: string; benefits: string[] }> = {
  operator: {
    color: "#9b87f5",
    benefits: [
      "Early beta access to the platform",
      "\"Founding Operator\" badge on your profile",
      "Priority support queue",
      "Monthly product updates & roadmap previews",
    ],
  },
  sovereign: {
    color: "#d4af37",
    benefits: [
      "Everything in Operator tier",
      "Lifetime Policy-Gate priority",
      "Private Discord access",
      "Direct line to the dev team",
      "Custom autonomy presets",
    ],
  },
  governance: {
    color: "#d4af37",
    benefits: [
      "Everything in Sovereign tier",
      "Your name engraved in the Genesis Receipt",
      "1-on-1 founder setup session",
      "Quarterly strategy calls",
      "Shape the product roadmap",
      "Lifetime founding status",
    ],
  },
};

const generateCertificateHTML = (name: string, tier: string, backerNumber: number, date: string) => {
  const tierColor = tierBenefits[tier]?.color || "#9b87f5";
  const tierName = tier.charAt(0).toUpperCase() + tier.slice(1);
  
  return `
    <div style="background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%); border: 2px solid ${tierColor}; border-radius: 16px; padding: 48px; max-width: 600px; margin: 32px auto; text-align: center; font-family: 'Georgia', serif;">
      <div style="border-bottom: 1px solid ${tierColor}40; padding-bottom: 24px; margin-bottom: 24px;">
        <h2 style="color: ${tierColor}; font-size: 14px; letter-spacing: 4px; margin: 0; text-transform: uppercase;">Certificate of Founding Membership</h2>
      </div>
      
      <div style="margin: 32px 0;">
        <p style="color: #888; font-size: 14px; margin: 0;">This certifies that</p>
        <h1 style="color: #fff; font-size: 32px; margin: 16px 0; font-weight: bold;">${name}</h1>
        <p style="color: #888; font-size: 14px; margin: 0;">is a verified</p>
        <div style="background: linear-gradient(90deg, ${tierColor}20, ${tierColor}40, ${tierColor}20); padding: 16px 32px; border-radius: 8px; display: inline-block; margin: 16px 0;">
          <h2 style="color: ${tierColor}; font-size: 24px; margin: 0; text-transform: uppercase; letter-spacing: 2px;">${tierName} Backer</h2>
        </div>
        <p style="color: #666; font-size: 12px; margin-top: 8px;">Founding Member #${String(backerNumber).padStart(4, '0')}</p>
      </div>
      
      <div style="border-top: 1px solid ${tierColor}40; padding-top: 24px; margin-top: 24px;">
        <p style="color: #666; font-size: 12px; margin: 0;">Issued on ${date}</p>
        <p style="color: ${tierColor}; font-size: 14px; margin-top: 8px; font-style: italic;">SITA – Sovereign Intelligent Task Agent</p>
      </div>
    </div>
  `;
};

const generateWelcomeEmail = (name: string, tier: string, backerNumber: number) => {
  const firstName = name.split(" ")[0];
  const tierName = tier.charAt(0).toUpperCase() + tier.slice(1);
  const tierColor = tierBenefits[tier]?.color || "#9b87f5";
  const benefits = tierBenefits[tier]?.benefits || [];
  const date = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  const benefitsList = benefits
    .map(
      (b) => `
      <tr>
        <td style="padding: 8px 0; color: #ccc; font-size: 14px;">
          <span style="color: ${tierColor}; margin-right: 8px;">✓</span>${b}
        </td>
      </tr>
    `
    )
    .join("");

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; background-color: #050505; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #050505; padding: 40px 20px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px;">
              <!-- Header -->
              <tr>
                <td style="text-align: center; padding-bottom: 32px;">
                  <h1 style="color: #fff; font-size: 28px; margin: 0;">SITA</h1>
                  <p style="color: ${tierColor}; font-size: 12px; letter-spacing: 2px; margin: 8px 0 0; text-transform: uppercase;">Sovereign Intelligent Task Agent</p>
                </td>
              </tr>
              
              <!-- Welcome Message -->
              <tr>
                <td style="background: linear-gradient(135deg, #0a0a0a 0%, #111 100%); border: 1px solid #222; border-radius: 16px; padding: 40px;">
                  <h2 style="color: #fff; font-size: 24px; margin: 0 0 16px;">Welcome to the Governance Revolution, ${firstName}! 🎉</h2>
                  <p style="color: #aaa; font-size: 16px; line-height: 1.6; margin: 0 0 24px;">
                    You've officially joined an elite group of visionaries backing the future of AI-powered autonomy. 
                    As <strong style="color: ${tierColor};">${tierName} Backer #${String(backerNumber).padStart(4, '0')}</strong>, 
                    you're not just an early adopter—you're a founding architect.
                  </p>
                  
                  <!-- Benefits Box -->
                  <div style="background: #0a0a0a; border: 1px solid ${tierColor}40; border-radius: 12px; padding: 24px; margin: 24px 0;">
                    <h3 style="color: ${tierColor}; font-size: 14px; margin: 0 0 16px; text-transform: uppercase; letter-spacing: 1px;">Your ${tierName} Benefits</h3>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      ${benefitsList}
                    </table>
                  </div>
                  
                  <!-- Next Steps -->
                  <h3 style="color: #fff; font-size: 18px; margin: 32px 0 16px;">What Happens Next?</h3>
                  <ol style="color: #aaa; font-size: 14px; line-height: 1.8; margin: 0; padding-left: 20px;">
                    <li>You'll receive payment instructions within 24 hours</li>
                    <li>Once confirmed, your Founding Member status is permanently locked in</li>
                    <li>Beta access invites will be sent in the order backers joined</li>
                    ${tier === "governance" ? "<li>We'll reach out to schedule your 1-on-1 founder session</li>" : ""}
                  </ol>
                </td>
              </tr>
              
              <!-- Certificate -->
              <tr>
                <td style="padding-top: 32px;">
                  <h3 style="color: #fff; font-size: 18px; text-align: center; margin: 0 0 16px;">Your Founding Member Certificate</h3>
                  ${generateCertificateHTML(name, tier, backerNumber, date)}
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="text-align: center; padding-top: 40px; border-top: 1px solid #222; margin-top: 40px;">
                  <p style="color: #666; font-size: 12px; margin: 0;">
                    Questions? Reply to this email or reach us at hello@sita.ai
                  </p>
                  <p style="color: #444; font-size: 11px; margin: 16px 0 0;">
                    © ${new Date().getFullYear()} SITA. All rights reserved.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
};

interface SendEmailRequest {
  email: string;
  name: string;
  tier: string;
  donorId?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { email, name, tier, donorId }: SendEmailRequest = await req.json();

    if (!email || !name || !tier) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: email, name, tier" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Get backer number
    let backerNumber = 1;
    if (donorId) {
      const { data: donor } = await supabase
        .from("donors")
        .select("created_at")
        .eq("id", donorId)
        .single();

      if (donor) {
        const { count } = await supabase
          .from("donors")
          .select("*", { count: "exact", head: true })
          .lte("created_at", donor.created_at);
        backerNumber = count || 1;
      }
    } else {
      // Count all donors
      const { count } = await supabase
        .from("donors")
        .select("*", { count: "exact", head: true });
      backerNumber = (count || 0) + 1;
    }

    const tierName = tier.charAt(0).toUpperCase() + tier.slice(1);
    const emailHtml = generateWelcomeEmail(name, tier, backerNumber);

    const emailResponse = await resend.emails.send({
      from: "SITA <welcome@sita.ai>",
      to: [email],
      subject: `🎉 Welcome to SITA, Founding ${tierName} #${String(backerNumber).padStart(4, '0')}!`,
      html: emailHtml,
    });

    console.log("Email sent successfully:", emailResponse);

    // Update donor record if ID provided
    if (donorId) {
      await supabase
        .from("donors")
        .update({ 
          welcome_email_sent: true,
          last_email_sent_at: new Date().toISOString(),
          email_sequence_step: 1,
        })
        .eq("id", donorId);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Email sent successfully",
        emailId: emailResponse.id,
        backerNumber 
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in send-single-email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
