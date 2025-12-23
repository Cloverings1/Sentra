// Supabase Edge Function: create-checkout-session
// Creates a Stripe Checkout Session for subscription purchases
// Deploy with: supabase functions deploy create-checkout-session

import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import Stripe from "https://esm.sh/stripe@14.10.0?target=deno";

// Initialize Stripe
const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", {
  apiVersion: "2023-10-16",
  httpClient: Stripe.createFetchHttpClient(),
});

// Initialize Supabase clients
const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

// CORS headers for browser requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Request body interface
interface CheckoutRequest {
  priceId: string;
  successUrl?: string;
  cancelUrl?: string;
}

serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  // Only allow POST requests
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    // Extract the JWT token from the Authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Create a Supabase client with the user's JWT for auth verification
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: { Authorization: authHeader },
      },
    });

    // Get the authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabaseAuth.auth.getUser();

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized", details: authError?.message }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Parse the request body
    const body: CheckoutRequest = await req.json();
    const { priceId, successUrl, cancelUrl } = body;

    if (!priceId) {
      return new Response(
        JSON.stringify({ error: "Missing required field: priceId" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Create a Supabase client with service role to update user profile
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Get the user's profile to check for existing Stripe customer
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("user_profiles")
      .select("stripe_customer_id")
      .eq("id", user.id)
      .single();

    if (profileError && profileError.code !== "PGRST116") {
      // PGRST116 = no rows found, which is okay
      console.error("Error fetching user profile:", profileError);
      return new Response(
        JSON.stringify({ error: "Error fetching user profile" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    let stripeCustomerId = profile?.stripe_customer_id;

    // If user doesn't have a Stripe customer, create one
    if (!stripeCustomerId) {
      try {
        const customer = await stripe.customers.create({
          email: user.email,
          metadata: {
            supabase_user_id: user.id,
          },
        });
        stripeCustomerId = customer.id;

        // Save the Stripe customer ID to the user's profile
        const { error: updateError } = await supabaseAdmin
          .from("user_profiles")
          .upsert(
            {
              id: user.id,
              stripe_customer_id: stripeCustomerId,
              updated_at: new Date().toISOString(),
            },
            {
              onConflict: "id",
            }
          );

        if (updateError) {
          console.error("Error saving Stripe customer ID:", updateError);
          // Continue anyway - the checkout will still work
        }
      } catch (stripeError) {
        console.error("Error creating Stripe customer:", stripeError);
        return new Response(
          JSON.stringify({ error: "Error creating Stripe customer" }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
    }

    // Default URLs if not provided
    const defaultSuccessUrl = `${req.headers.get("origin") || "http://localhost:5173"}/?checkout=success`;
    const defaultCancelUrl = `${req.headers.get("origin") || "http://localhost:5173"}/?checkout=canceled`;

    // Create the Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl || defaultSuccessUrl,
      cancel_url: cancelUrl || defaultCancelUrl,
      // Allow promotion codes
      allow_promotion_codes: true,
      // Collect billing address for tax purposes
      billing_address_collection: "auto",
      // Automatic tax calculation (if configured in Stripe)
      automatic_tax: { enabled: false },
      // Subscription data
      subscription_data: {
        metadata: {
          supabase_user_id: user.id,
        },
      },
      // Customer update settings
      customer_update: {
        address: "auto",
        name: "auto",
      },
    });

    console.log(
      `Created checkout session ${session.id} for user ${user.id} with price ${priceId}`
    );

    return new Response(
      JSON.stringify({
        sessionId: session.id,
        url: session.url,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error("Error creating checkout session:", errorMessage);
    return new Response(
      JSON.stringify({ error: "Error creating checkout session", details: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
