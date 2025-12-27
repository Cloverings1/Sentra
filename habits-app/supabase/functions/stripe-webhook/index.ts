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

type WebhookEventStatus = "processing" | "succeeded" | "failed";

// Type definitions for better type safety
interface SubscriptionUpdate {
  subscription_status: "free" | "trialing" | "active" | "canceled" | "past_due";
  subscription_id: string | null;
  price_id: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  trial_start?: string | null;
  trial_end?: string | null;
  is_trial_user?: boolean;
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
): "free" | "trialing" | "active" | "canceled" | "past_due" {
  switch (stripeStatus) {
    case "active":
      return "active";
    case "trialing":
      return "trialing"; // Now properly tracked as distinct status
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

  // Extract trial information
  const isTrialing = subscription.status === "trialing";
  const trialStart = subscription.trial_start
    ? new Date(subscription.trial_start * 1000).toISOString()
    : null;
  const trialEnd = subscription.trial_end
    ? new Date(subscription.trial_end * 1000).toISOString()
    : null;

  const result = await updateUserProfile(customerId, {
    subscription_status: status,
    subscription_id: subscription.id,
    price_id: priceId,
    current_period_end: new Date(
      subscription.current_period_end * 1000
    ).toISOString(),
    cancel_at_period_end: subscription.cancel_at_period_end,
    trial_start: trialStart,
    trial_end: trialEnd,
    is_trial_user: isTrialing,
  });

  // Also update new billing schema if available
  const userId = subscription.metadata?.supabase_user_id;
  if (userId) {
    const newStatus =
      status === "trialing" ? "trialing" : status === "active" ? "active" : status === "past_due" ? "past_due" : "canceled";
    await supabase.from("user_entitlements").upsert(
      {
        user_id: userId,
        plan: "pro",
        status: newStatus,
        stripe_subscription_id: subscription.id,
        trial_ends_at: trialEnd,
        current_period_ends_at: new Date(
          subscription.current_period_end * 1000
        ).toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );
  }

  if (!result.success) {
    return new Response(JSON.stringify({ error: result.error }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  console.log(
    `Subscription created for customer ${customerId}: ${subscription.id}, status: ${status}, trial: ${isTrialing}`
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

  // Extract trial information - preserve is_trial_user if they were ever trialing
  const isTrialing = subscription.status === "trialing";
  const trialStart = subscription.trial_start
    ? new Date(subscription.trial_start * 1000).toISOString()
    : null;
  const trialEnd = subscription.trial_end
    ? new Date(subscription.trial_end * 1000).toISOString()
    : null;

  const result = await updateUserProfile(customerId, {
    subscription_status: status,
    subscription_id: subscription.id,
    price_id: priceId,
    current_period_end: new Date(
      subscription.current_period_end * 1000
    ).toISOString(),
    cancel_at_period_end: subscription.cancel_at_period_end,
    trial_start: trialStart,
    trial_end: trialEnd,
    // Only set is_trial_user to true (once a trial user, always tracked as such)
    ...(isTrialing && { is_trial_user: true }),
  });

  // Also update new billing schema if available
  const userId = subscription.metadata?.supabase_user_id;
  if (userId) {
    const newStatus =
      status === "trialing" ? "trialing" : status === "active" ? "active" : status === "past_due" ? "past_due" : "canceled";
    await supabase.from("user_entitlements").upsert(
      {
        user_id: userId,
        plan: "pro",
        status: newStatus,
        stripe_subscription_id: subscription.id,
        trial_ends_at: trialEnd,
        current_period_ends_at: new Date(
          subscription.current_period_end * 1000
        ).toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );
  }

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

// Helper: Get user_id from customer ID by checking billing_customers and user_profiles
async function getUserIdFromCustomer(stripeCustomerId: string): Promise<string | null> {
  // Try billing_customers first (new table)
  const { data: billingData } = await supabase
    .from('billing_customers')
    .select('user_id')
    .eq('stripe_customer_id', stripeCustomerId)
    .maybeSingle();

  if (billingData?.user_id) {
    console.log('Found user in billing_customers:', billingData.user_id);
    return billingData.user_id;
  }

  // Fallback to user_profiles (legacy)
  const { data: profileData } = await supabase
    .from('user_profiles')
    .select('id')
    .eq('stripe_customer_id', stripeCustomerId)
    .maybeSingle();

  if (profileData?.id) {
    console.log('Found user in user_profiles:', profileData.id);
    return profileData.id;
  }

  return null;
}

// Handle checkout.session.completed event (for one-time payments like Founding)
async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session
): Promise<Response> {
  const customerId =
    typeof session.customer === "string" ? session.customer : session.customer?.id;

  if (!customerId) {
    console.error("No customer ID in checkout session");
    return new Response(JSON.stringify({ error: "No customer in session" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const planType = session.metadata?.plan_type;
  // Get user_id from metadata first, then fall back to customer lookup
  let userId = session.metadata?.supabase_user_id;

  if (!userId) {
    userId = await getUserIdFromCustomer(customerId) ?? undefined;
  }

  console.log(`Checkout completed: planType=${planType}, userId=${userId}, customerId=${customerId}`);

  // Handle founding membership purchase
  if (planType === "founding") {
    if (!userId) {
      console.error("No user ID in founding checkout session");
      return new Response(JSON.stringify({ error: "No user in session" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    try {
      // P1-BILL-3: Use transactional RPC to claim slot atomically
      // This prevents race conditions where two payments could both succeed
      // but only one slot is available. The RPC uses FOR UPDATE locking.
      const { data: claimResult, error: claimError } = await supabase.rpc(
        "claim_founding_slot",
        { user_uuid: userId }
      );

      if (claimError) {
        console.error("Error claiming founding slot:", claimError);
        throw claimError;
      }

      // Check if slot was successfully claimed
      if (!claimResult?.success) {
        // This is an edge case: user paid but no slots available
        // This can happen if slots ran out between checkout creation and payment
        console.error(
          `No founding slots available for user ${userId}. Payment received but slot claim failed.`
        );
        // Still return 200 to Stripe (payment succeeded, we need to handle refund separately)
        // TODO: Trigger a refund via Stripe API or flag for manual review
        return new Response(
          JSON.stringify({
            received: true,
            action: "founding_slot_unavailable",
            warning: "Payment received but no slots available - manual review required",
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      // Update user profile for backward compatibility
      await updateUserProfile(customerId, {
        subscription_status: "diamond",
        subscription_id: null,
        price_id: null,
        current_period_end: null,
        cancel_at_period_end: false,
        trial_start: null,
        trial_end: null,
        is_trial_user: false,
      });

      console.log(
        `Founding membership activated for user ${userId}, slot ${claimResult.slot_id}`
      );

      return new Response(
        JSON.stringify({ received: true, action: "founding_payment_completed" }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      console.error(`Error processing founding checkout: ${errorMessage}`);
      return new Response(
        JSON.stringify({ error: `Error processing founding checkout: ${errorMessage}` }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  }

  // Handle Pro subscription checkout (planType === "pro" or subscription exists)
  if (session.subscription && userId) {
    const subscriptionId = typeof session.subscription === "string"
      ? session.subscription
      : session.subscription.id;

    try {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      const isTrialing = subscription.status === "trialing";
      const trialEnd = subscription.trial_end
        ? new Date(subscription.trial_end * 1000).toISOString()
        : null;
      const periodEnd = new Date(subscription.current_period_end * 1000).toISOString();

      console.log(`Pro subscription: status=${subscription.status}, trial_end=${trialEnd}, userId=${userId}`);

      // Update user_entitlements for Pro subscription
      const { error: entitlementError } = await supabase.from("user_entitlements").upsert(
        {
          user_id: userId,
          plan: "pro",
          status: isTrialing ? "trialing" : "active",
          stripe_subscription_id: subscriptionId,
          trial_ends_at: trialEnd,
          current_period_ends_at: periodEnd,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );

      if (entitlementError) {
        console.error("Error updating entitlement from checkout:", entitlementError);
      } else {
        console.log(`Updated entitlement for user ${userId}: pro/${isTrialing ? "trialing" : "active"}`);
      }

      return new Response(
        JSON.stringify({ received: true, action: "pro_checkout_completed" }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    } catch (err) {
      console.error("Error processing pro checkout:", err);
    }
  }

  // Acknowledge other checkout session types
  return new Response(
    JSON.stringify({ received: true, action: "checkout_session_completed" }),
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
    trial_start: null,
    trial_end: null,
    // Keep is_trial_user for analytics tracking
  });

  // Also update new billing schema if available
  // P1-BILL-2 FIX: Set plan to 'none' on deletion (not 'pro')
  const userId = subscription.metadata?.supabase_user_id;
  if (userId) {
    await supabase.from("user_entitlements").upsert(
      {
        user_id: userId,
        plan: "none",  // FIXED: Was incorrectly set to 'pro'
        status: "canceled",
        stripe_subscription_id: null,  // Clear subscription reference
        current_period_ends_at: null,  // Clear period end
        trial_ends_at: null,  // Clear trial
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );
  }

  if (!result.success) {
    return new Response(JSON.stringify({ error: result.error }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  console.log(`Subscription deleted for customer ${customerId}, downgraded to free tier`);

  return new Response(
    JSON.stringify({ received: true, action: "subscription_deleted" }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }
  );
}

const PROCESSING_STALE_MS = 10 * 60 * 1000; // 10 minutes

async function getEventRow(eventId: string): Promise<{ status: WebhookEventStatus; processed_at: string | null } | null> {
  const { data } = await supabase
    .from("processed_webhook_events")
    .select("status, processed_at")
    .eq("id", eventId)
    .maybeSingle();
  if (!data) return null;
  return {
    status: (data.status ?? "succeeded") as WebhookEventStatus,
    processed_at: data.processed_at ?? null,
  };
}

/**
 * Acquire processing ownership for an event.
 * - If event already succeeded => return { action: 'skip' }
 * - If another worker is processing recently => return { action: 'skip' }
 * - If stale processing or failed => reclaim and process
 */
async function acquireEventProcessing(
  eventId: string,
  eventType: string,
  metadata: Record<string, unknown>
): Promise<{ action: "process" | "skip"; reason?: string }> {
  const nowIso = new Date().toISOString();

  // Try first-time insert (fast path).
  const insertRes = await supabase.from("processed_webhook_events").insert({
    id: eventId,
    event_type: eventType,
    status: "processing",
    processed_at: nowIso,
    metadata,
  });

  if (!insertRes.error) {
    return { action: "process" };
  }

  const existing = await getEventRow(eventId);
  if (existing?.status === "succeeded") {
    return { action: "skip", reason: "already_processed" };
  }

  // If currently processing and not stale, assume another worker owns it.
  if (existing?.status === "processing" && existing.processed_at) {
    const ageMs = Date.now() - new Date(existing.processed_at).getTime();
    if (!isNaN(ageMs) && ageMs < PROCESSING_STALE_MS) {
      return { action: "skip", reason: "duplicate_processing" };
    }
  }

  // Attempt to reclaim if failed or stale-processing.
  const staleBeforeIso = new Date(Date.now() - PROCESSING_STALE_MS).toISOString();
  const { data: reclaimed } = await supabase
    .from("processed_webhook_events")
    .update({
      event_type: eventType,
      status: "processing",
      processed_at: nowIso,
      metadata,
      error: null,
    })
    .eq("id", eventId)
    .in("status", ["failed", "processing"])
    .lt("processed_at", staleBeforeIso)
    .select("id")
    .maybeSingle();

  if (reclaimed) {
    return { action: "process" };
  }

  // If we couldn't reclaim, treat as already being handled.
  return { action: "skip", reason: existing?.status === "processing" ? "duplicate_processing" : "already_processed" };
}

async function markEventSucceeded(eventId: string, metadata: Record<string, unknown> = {}) {
  await supabase
    .from("processed_webhook_events")
    .update({
      status: "succeeded",
      metadata,
      error: null,
    })
    .eq("id", eventId);
}

async function markEventFailed(eventId: string, errorMessage: string, metadata: Record<string, unknown> = {}) {
  await supabase
    .from("processed_webhook_events")
    .update({
      status: "failed",
      metadata,
      error: errorMessage,
    })
    .eq("id", eventId);
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

  console.log(`Received webhook event: ${event.type} (${event.id})`);

  // Idempotency + concurrency safety:
  // - Acquire processing ownership (insert processing row, or reclaim stale/failed)
  // - Mark succeeded/failed AFTER handling so retries aren't permanently blocked
  const acquire = await acquireEventProcessing(event.id, event.type, {
    created: event.created,
    livemode: event.livemode,
  });

  if (acquire.action === "skip") {
    console.log(`Event ${event.id} skipped: ${acquire.reason}`);
    return new Response(
      JSON.stringify({ received: true, action: acquire.reason || "skipped" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  // Handle the event based on type
  try {
    let result: Response;
    switch (event.type) {
      case "customer.subscription.created":
        result = await handleSubscriptionCreated(
          event.data.object as Stripe.Subscription
        );
        break;

      case "customer.subscription.updated":
        result = await handleSubscriptionUpdated(
          event.data.object as Stripe.Subscription
        );
        break;

      case "customer.subscription.deleted":
        result = await handleSubscriptionDeleted(
          event.data.object as Stripe.Subscription
        );
        break;

      case "checkout.session.completed":
        result = await handleCheckoutSessionCompleted(
          event.data.object as Stripe.Checkout.Session
        );
        break;

      default:
        // Acknowledge receipt of unhandled events
        console.log(`Unhandled event type: ${event.type}`);
        result = new Response(
          JSON.stringify({ received: true, action: "ignored" }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          }
        );
        break;
    }

    await markEventSucceeded(event.id, {
      created: event.created,
      livemode: event.livemode,
      type: event.type,
      action: "succeeded",
    });

    return result;
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error(`Error handling webhook event: ${errorMessage}`);
    await markEventFailed(event.id, errorMessage, {
      created: event.created,
      livemode: event.livemode,
      type: event.type,
      action: "failed",
    });
    return new Response(
      JSON.stringify({ error: `Error handling webhook: ${errorMessage}` }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
});
