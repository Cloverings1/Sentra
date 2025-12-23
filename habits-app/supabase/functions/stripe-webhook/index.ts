// Supabase Edge Function: stripe-webhook
// Handles Stripe webhook events for subscription management
// Deploy with: supabase functions deploy stripe-webhook --no-verify-jwt

import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import Stripe from "https://esm.sh/stripe@14.10.0?target=deno";

// Initialize Stripe with the secret key
const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", {
  apiVersion: "2023-10-16",
  httpClient: Stripe.createFetchHttpClient(),
});

// Initialize Supabase with service role key to bypass RLS
const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Webhook signing secret for signature verification
const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET") ?? "";

// Type definitions for better type safety
interface SubscriptionUpdate {
  subscription_status: "free" | "active" | "canceled" | "past_due";
  subscription_id: string | null;
  price_id: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  updated_at: string;
}

// Helper function to update user profile
async function updateUserProfile(
  stripeCustomerId: string,
  updates: Partial<SubscriptionUpdate>
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from("user_profiles")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("stripe_customer_id", stripeCustomerId);

  if (error) {
    console.error("Error updating user profile:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

// Map Stripe subscription status to our internal status
function mapStripeStatus(
  stripeStatus: Stripe.Subscription.Status
): "free" | "active" | "canceled" | "past_due" {
  switch (stripeStatus) {
    case "active":
    case "trialing":
      return "active";
    case "past_due":
    case "unpaid":
      return "past_due";
    case "canceled":
    case "incomplete_expired":
      return "canceled";
    case "incomplete":
    case "paused":
    default:
      return "free";
  }
}

// Handle subscription.created event
async function handleSubscriptionCreated(
  subscription: Stripe.Subscription
): Promise<Response> {
  const customerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer.id;

  const priceId = subscription.items.data[0]?.price.id ?? null;
  const status = mapStripeStatus(subscription.status);

  const result = await updateUserProfile(customerId, {
    subscription_status: status,
    subscription_id: subscription.id,
    price_id: priceId,
    current_period_end: new Date(
      subscription.current_period_end * 1000
    ).toISOString(),
    cancel_at_period_end: subscription.cancel_at_period_end,
  });

  if (!result.success) {
    return new Response(JSON.stringify({ error: result.error }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  console.log(
    `Subscription created for customer ${customerId}: ${subscription.id}`
  );

  return new Response(
    JSON.stringify({ received: true, action: "subscription_created" }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }
  );
}

// Handle subscription.updated event
async function handleSubscriptionUpdated(
  subscription: Stripe.Subscription
): Promise<Response> {
  const customerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer.id;

  const priceId = subscription.items.data[0]?.price.id ?? null;
  const status = mapStripeStatus(subscription.status);

  const result = await updateUserProfile(customerId, {
    subscription_status: status,
    subscription_id: subscription.id,
    price_id: priceId,
    current_period_end: new Date(
      subscription.current_period_end * 1000
    ).toISOString(),
    cancel_at_period_end: subscription.cancel_at_period_end,
  });

  if (!result.success) {
    return new Response(JSON.stringify({ error: result.error }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  console.log(
    `Subscription updated for customer ${customerId}: status=${status}, cancel_at_period_end=${subscription.cancel_at_period_end}`
  );

  return new Response(
    JSON.stringify({ received: true, action: "subscription_updated" }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }
  );
}

// Handle subscription.deleted event
async function handleSubscriptionDeleted(
  subscription: Stripe.Subscription
): Promise<Response> {
  const customerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer.id;

  const result = await updateUserProfile(customerId, {
    subscription_status: "free",
    subscription_id: null,
    price_id: null,
    current_period_end: null,
    cancel_at_period_end: false,
  });

  if (!result.success) {
    return new Response(JSON.stringify({ error: result.error }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  console.log(`Subscription deleted for customer ${customerId}`);

  return new Response(
    JSON.stringify({ received: true, action: "subscription_deleted" }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }
  );
}

// Main handler
serve(async (req: Request): Promise<Response> => {
  // Only allow POST requests
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Get the raw body for signature verification
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    console.error("Missing stripe-signature header");
    return new Response(
      JSON.stringify({ error: "Missing stripe-signature header" }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  if (!webhookSecret) {
    console.error("Missing STRIPE_WEBHOOK_SECRET environment variable");
    return new Response(
      JSON.stringify({ error: "Webhook secret not configured" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  // Verify the webhook signature
  let event: Stripe.Event;

  try {
    event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      webhookSecret
    );
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error(`Webhook signature verification failed: ${errorMessage}`);
    return new Response(
      JSON.stringify({ error: `Webhook signature verification failed: ${errorMessage}` }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  console.log(`Received webhook event: ${event.type}`);

  // Handle the event based on type
  try {
    switch (event.type) {
      case "customer.subscription.created":
        return await handleSubscriptionCreated(
          event.data.object as Stripe.Subscription
        );

      case "customer.subscription.updated":
        return await handleSubscriptionUpdated(
          event.data.object as Stripe.Subscription
        );

      case "customer.subscription.deleted":
        return await handleSubscriptionDeleted(
          event.data.object as Stripe.Subscription
        );

      default:
        // Acknowledge receipt of unhandled events
        console.log(`Unhandled event type: ${event.type}`);
        return new Response(
          JSON.stringify({ received: true, action: "ignored" }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          }
        );
    }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error(`Error handling webhook event: ${errorMessage}`);
    return new Response(
      JSON.stringify({ error: `Error handling webhook: ${errorMessage}` }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
});
