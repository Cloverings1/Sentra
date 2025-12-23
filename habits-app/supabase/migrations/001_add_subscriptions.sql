-- ============================================================================
-- Migration: 001_add_subscriptions
-- Description: Add subscription management tables for Stripe integration
-- ============================================================================

-- ============================================================================
-- USER PROFILES TABLE
-- Stores Stripe subscription data linked to auth.users
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT UNIQUE,
  subscription_status TEXT DEFAULT 'free' CHECK (subscription_status IN ('free', 'active', 'canceled', 'past_due')),
  subscription_id TEXT,
  price_id TEXT,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster lookups by stripe_customer_id (used in webhooks)
CREATE INDEX IF NOT EXISTS idx_user_profiles_stripe_customer_id
  ON user_profiles(stripe_customer_id)
  WHERE stripe_customer_id IS NOT NULL;

-- Create index for subscription status queries (used for feature gating)
CREATE INDEX IF NOT EXISTS idx_user_profiles_subscription_status
  ON user_profiles(subscription_status);

-- ============================================================================
-- BROKEN STREAKS TABLE
-- Records when a streak was broken for failure visibility feature
-- ============================================================================
CREATE TABLE IF NOT EXISTS broken_streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  habit_id UUID NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  streak_length INTEGER NOT NULL CHECK (streak_length > 0),
  broken_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(habit_id, broken_date)
);

-- Create index for user-based queries (dashboard views)
CREATE INDEX IF NOT EXISTS idx_broken_streaks_user_id
  ON broken_streaks(user_id);

-- Create index for habit-based queries (habit detail views)
CREATE INDEX IF NOT EXISTS idx_broken_streaks_habit_id
  ON broken_streaks(habit_id);

-- Create composite index for user + date queries (recent broken streaks)
CREATE INDEX IF NOT EXISTS idx_broken_streaks_user_date
  ON broken_streaks(user_id, broken_date DESC);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Users can only read their own profile
CREATE POLICY "Users can read own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Users can insert their own profile (for initial creation)
CREATE POLICY "Users can insert own profile"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Users can update their own profile (limited - mainly for non-Stripe fields)
-- Note: Stripe webhook updates use service_role which bypasses RLS
CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Service role can do anything (needed for webhook updates)
-- This is implicit with service_role key, no policy needed

-- Enable RLS on broken_streaks
ALTER TABLE broken_streaks ENABLE ROW LEVEL SECURITY;

-- Users can read their own broken streaks
CREATE POLICY "Users can read own broken streaks"
  ON broken_streaks
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can insert their own broken streaks
CREATE POLICY "Users can insert own broken streaks"
  ON broken_streaks
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own broken streaks (if they want to clear history)
CREATE POLICY "Users can delete own broken streaks"
  ON broken_streaks
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Function to auto-create user_profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, created_at, updated_at)
  VALUES (NEW.id, NOW(), NOW())
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function on new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at on user_profiles
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- BACKFILL EXISTING USERS
-- Create profiles for any existing users that don't have one
-- ============================================================================
INSERT INTO user_profiles (id, created_at, updated_at)
SELECT id, COALESCE(created_at, NOW()), NOW()
FROM auth.users
WHERE id NOT IN (SELECT id FROM user_profiles)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- HELPER FUNCTION: Check if user has active subscription
-- Can be used in RLS policies for premium features
-- ============================================================================
CREATE OR REPLACE FUNCTION is_subscribed(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM user_profiles
    WHERE id = user_uuid
    AND subscription_status = 'active'
    AND (current_period_end IS NULL OR current_period_end > NOW())
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION is_subscribed(UUID) TO authenticated;
