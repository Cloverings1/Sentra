-- ============================================================================
-- Migration: 005_add_trial_rls_enforcement
-- Description: Add RLS policies to enforce trial expiration at database level
--
-- This prevents users with expired trials from bypassing frontend checks by
-- directly calling the Supabase API to create habits or log completions.
-- ============================================================================

-- ============================================================================
-- UPDATE HABITS TABLE POLICIES
-- Users can still READ/UPDATE/DELETE existing habits, but can only INSERT
-- if they have active subscription access (paid, active trial, or diamond)
-- ============================================================================

-- Drop existing INSERT policy
DROP POLICY IF EXISTS "Users can only insert own habits" ON habits;

-- Create new INSERT policy with subscription check
CREATE POLICY "Users can only insert own habits with active access"
  ON habits
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND has_subscription_access(auth.uid())
  );

-- ============================================================================
-- UPDATE COMPLETIONS TABLE POLICIES
-- Users can still READ/DELETE existing completions, but can only INSERT
-- if they have active subscription access
-- ============================================================================

-- Drop existing INSERT policy
DROP POLICY IF EXISTS "Users can only insert own completions" ON completions;

-- Create new INSERT policy with subscription check
CREATE POLICY "Users can only insert own completions with active access"
  ON completions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND has_subscription_access(auth.uid())
  );

-- ============================================================================
-- OPTIONAL: Also restrict UPDATES on habits to active subscribers
-- This prevents users from modifying habit details after trial expires
-- ============================================================================

-- Drop existing UPDATE policy
DROP POLICY IF EXISTS "Users can only update own habits" ON habits;

-- Create new UPDATE policy with subscription check
CREATE POLICY "Users can only update own habits with active access"
  ON habits
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id
    AND has_subscription_access(auth.uid())
  );

-- ============================================================================
-- NOTE: SELECT and DELETE policies remain unchanged
-- - Users should always be able to VIEW their existing data
-- - Users should be able to DELETE their data even after expiration
--   (important for account cleanup and GDPR compliance)
-- ============================================================================
