import { loadStripe, type Stripe } from '@stripe/stripe-js';
import { supabase } from './supabase';

const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

let stripePromise: Promise<Stripe | null> | null = null;

export const getStripe = (): Promise<Stripe | null> => {
  if (!stripePromise && stripePublishableKey) {
    stripePromise = loadStripe(stripePublishableKey);
  }
  return stripePromise || Promise.resolve(null);
};

export const createCheckoutSession = async (priceId: string): Promise<void> => {
  const { data: sessionData, error } = await supabase.auth.getSession();

  if (error || !sessionData.session) {
    throw new Error('You must be logged in to subscribe');
  }

  const response = await supabase.functions.invoke('create-checkout-session', {
    body: { priceId },
  });

  if (response.error) {
    throw new Error(response.error.message || 'Failed to create checkout session');
  }

  const { sessionId } = response.data;

  const stripe = await getStripe();
  if (!stripe) {
    throw new Error('Stripe failed to initialize');
  }

  const { error: redirectError } = await stripe.redirectToCheckout({ sessionId });

  if (redirectError) {
    throw new Error(redirectError.message || 'Failed to redirect to checkout');
  }
};

export const createPortalSession = async (): Promise<void> => {
  const { data: sessionData, error } = await supabase.auth.getSession();

  if (error || !sessionData.session) {
    throw new Error('You must be logged in to manage subscription');
  }

  const response = await supabase.functions.invoke('create-portal-session', {
    body: {},
  });

  if (response.error) {
    throw new Error(response.error.message || 'Failed to create portal session');
  }

  const { url } = response.data;

  if (url) {
    window.location.href = url;
  } else {
    throw new Error('No portal URL returned');
  }
};

// Price IDs - these should match your Stripe dashboard
export const PRICE_IDS = {
  monthly: import.meta.env.VITE_STRIPE_MONTHLY_PRICE_ID || 'price_monthly',
  annual: import.meta.env.VITE_STRIPE_ANNUAL_PRICE_ID || 'price_annual',
} as const;
