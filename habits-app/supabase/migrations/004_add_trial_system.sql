-- ============================================================================
-- Migration: 004_add_trial_system
-- Description: Add 7-day trial system with proper status tracking
-- ============================================================================

-- Add trial tracking columns to user_profiles
ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS trial_start TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS trial_end TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS is_trial_user BOOLEAN DEFAULT FALSE;

-- Drop existing constraint (it may or may not include 'diamond')
ALTER TABLE user_profiles
  DROP CONSTRAINT IF EXISTS user_profiles_subscription_status_check;

-- Add updated constraint with 'trialing' and 'diamond' statuses
ALTER TABLE user_profiles
  ADD CONSTRAINT user_profiles_subscription_status_check
  CHECK (subscription_status IN ('free', 'trialing', 'active', 'canceled', 'past_due', 'diamond'));

-- Create index for trial expiration queries (used in app access checks)
CREATE INDEX IF NOT EXISTS idx_user_profiles_trial_end
  ON user_profiles(trial_end)
  WHERE trial_end IS NOT NULL;

-- Create index for trial users
CREATE INDEX IF NOT EXISTS idx_user_profiles_is_trial_user
  ON user_profiles(is_trial_user)
  WHERE is_trial_user = TRUE;

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Check if user's trial has expired
CREATE OR REPLACE FUNCTION is_trial_expired(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM user_profiles
    WHERE id = user_uuid
      AND subscription_status = 'trialing'
      AND trial_end IS NOT NULL
      AND trial_end < NOW()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user has active subscription access (paid, trial, or diamond)
CREATE OR REPLACE FUNCTION has_subscription_access(user_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  user_status TEXT;
  user_trial_end TIMESTAMPTZ;
  user_period_end TIMESTAMPTZ;
BEGIN
  SELECT subscription_status, trial_end, current_period_end
  INTO user_status, user_trial_end, user_period_end
  FROM user_profiles
  WHERE id = user_uuid;

  -- Diamond members always have access
  IF user_status = 'diamond' THEN
    RETURN TRUE;
  END IF;

  -- Active subscribers have access if within period
  IF user_status = 'active' THEN
    RETURN user_period_end IS NULL OR user_period_end > NOW();
  END IF;

  -- Trialing users have access if trial hasn't expired
  IF user_status = 'trialing' THEN
    RETURN user_trial_end IS NOT NULL AND user_trial_end > NOW();
  END IF;

  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the old is_subscribed function to include trial checking
CREATE OR REPLACE FUNCTION is_subscribed(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN has_subscription_access(user_uuid);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION is_trial_expired(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION has_subscription_access(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION is_subscribed(UUID) TO authenticated;

-- ============================================================================
-- FIX EXISTING DATA
-- ============================================================================

-- Fix Diamond users - ensure they have proper status
-- (Diamond users are tracked via founding_slots table, status should be 'diamond')
UPDATE user_profiles
SET subscription_status = 'diamond',
    is_trial_user = false
WHERE id IN (
  SELECT claimed_by_user_id
  FROM founding_slots
  WHERE claimed_by_user_id IS NOT NULL
)
AND (subscription_status != 'diamond' OR subscription_status IS NULL);

-- Set is_trial_user = false for all existing active users (they weren't trial users)
UPDATE user_profiles
SET is_trial_user = false
WHERE subscription_status = 'active'
  AND is_trial_user IS NULL;
