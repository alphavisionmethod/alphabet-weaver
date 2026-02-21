import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: { "Access-Control-Allow-Origin": "*" } });
  }

  const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
    apiVersion: "2025-08-27.basil",
  });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  // If STRIPE_WEBHOOK_SECRET is set, verify signature
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  let event: Stripe.Event;

  try {
    if (webhookSecret && sig) {
      event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    } else {
      event = JSON.parse(body) as Stripe.Event;
    }
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return new Response(JSON.stringify({ error: "Invalid signature" }), { status: 400 });
  }

  console.log("Received Stripe event:", event.type);

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const { tier, donor_name, message } = session.metadata || {};

    // Update donation record to approved
    const { error: updateError } = await supabase
      .from("donations")
      .update({
        status: "approved",
        stripe_session_id: session.id,
      })
      .eq("email", session.customer_email || session.customer_details?.email || "")
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(1);

    if (updateError) {
      console.error("Failed to update donation:", updateError);
    }

    // Also create/update donor record for the backers list
    const donorEmail = session.customer_email || session.customer_details?.email;
    if (donorEmail && tier) {
      const amount = (session.amount_total || 0) / 100;
      await supabase.from("donors").upsert(
        {
          email: donorEmail,
          name: donor_name || donorEmail.split("@")[0],
          tier,
          amount,
        },
        { onConflict: "email" }
      );
    }

    console.log("Checkout session completed for:", session.customer_email);
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { "Content-Type": "application/json" },
    status: 200,
  });
});
