import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { supabase } from '../utils/supabase';
import { useAuth } from './AuthContext';
import { createCheckoutSession, createPortalSession, PRICE_IDS } from '../utils/stripe';
import type { UserProfile, SubscriptionStatus } from '../types';

const FREE_HABIT_LIMIT = 3;

interface SubscriptionContextType {
  status: SubscriptionStatus;
  isPro: boolean;
  isDiamond: boolean;
  hasPremiumAccess: boolean; // true for both Pro and Diamond
  canCreateHabit: (currentHabitCount: number) => boolean;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  loading: boolean;
  openCheckout: (plan: 'monthly' | 'annual') => Promise<void>;
  openPortal: () => Promise<void>;
  habitLimitReached: (currentHabitCount: number) => boolean;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const SubscriptionProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        // Profile might not exist yet for new users
        if (error.code === 'PGRST116') {
          // No rows returned - user has no profile yet, use defaults
          setProfile({
            id: user.id,
            stripe_customer_id: null,
            subscription_status: 'free',
            subscription_id: null,
            price_id: null,
            current_period_end: null,
            cancel_at_period_end: false,
          });
        } else {
          console.error('Error fetching user profile:', error);
        }
      } else if (data) {
        setProfile({
          id: data.id,
          stripe_customer_id: data.stripe_customer_id,
          subscription_status: data.subscription_status || 'free',
          subscription_id: data.subscription_id,
          price_id: data.price_id,
          current_period_end: data.current_period_end,
          cancel_at_period_end: data.cancel_at_period_end || false,
        });
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Fetch profile on mount and user change
  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Subscribe to realtime changes on user_profiles table
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`user_profiles:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_profiles',
          filter: `id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
            const data = payload.new;
            setProfile({
              id: data.id,
              stripe_customer_id: data.stripe_customer_id,
              subscription_status: data.subscription_status || 'free',
              subscription_id: data.subscription_id,
              price_id: data.price_id,
              current_period_end: data.current_period_end,
              cancel_at_period_end: data.cancel_at_period_end || false,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const status: SubscriptionStatus = profile?.subscription_status || 'free';
  const isPro = status === 'active';
  const isDiamond = status === 'diamond';
  const hasPremiumAccess = isPro || isDiamond; // Diamond users get all Pro features
  const currentPeriodEnd = profile?.current_period_end || null;
  const cancelAtPeriodEnd = profile?.cancel_at_period_end || false;

  const canCreateHabit = useCallback(
    (currentHabitCount: number): boolean => {
      if (hasPremiumAccess) return true;
      return currentHabitCount < FREE_HABIT_LIMIT;
    },
    [hasPremiumAccess]
  );

  const habitLimitReached = useCallback(
    (currentHabitCount: number): boolean => {
      if (hasPremiumAccess) return false;
      return currentHabitCount >= FREE_HABIT_LIMIT;
    },
    [hasPremiumAccess]
  );

  const openCheckout = useCallback(async (plan: 'monthly' | 'annual') => {
    const priceId = plan === 'monthly' ? PRICE_IDS.monthly : PRICE_IDS.annual;
    await createCheckoutSession(priceId);
  }, []);

  const openPortal = useCallback(async () => {
    await createPortalSession();
  }, []);

  return (
    <SubscriptionContext.Provider
      value={{
        status,
        isPro,
        isDiamond,
        hasPremiumAccess,
        canCreateHabit,
        currentPeriodEnd,
        cancelAtPeriodEnd,
        loading,
        openCheckout,
        openPortal,
        habitLimitReached,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = (): SubscriptionContextType => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};
