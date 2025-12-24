-- ============================================================================
-- Migration: 006_create_billing_schema
-- Description: Create billing tables for Stripe integration with clean separation
-- ============================================================================

-- ============================================================================
-- BILLING_CUSTOMERS TABLE
-- Maps users to Stripe customers
-- ============================================================================
CREATE TABLE IF NOT EXISTS billing_customers (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_billing_customers_stripe_id
  ON billing_customers(stripe_customer_id);

-- ============================================================================
-- USER_ENTITLEMENTS TABLE
-- Tracks plan, status, trial/billing dates
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_entitlements (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  plan TEXT DEFAULT 'none' CHECK (plan IN ('none', 'pro', 'founding')),
  status TEXT DEFAULT 'none' CHECK (status IN ('none', 'trialing', 'active', 'past_due', 'canceled', 'expired')),
  stripe_subscription_id TEXT,
  trial_ends_at TIMESTAMPTZ,
  current_period_ends_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_entitlements_plan
  ON user_entitlements(plan);

CREATE INDEX IF NOT EXISTS idx_user_entitlements_status
  ON user_entitlements(status);

-- ============================================================================
-- FOUNDING_SLOTS TABLE
-- Tracks founding member spots (enhance existing if exists)
-- ============================================================================
CREATE TABLE IF NOT EXISTS founding_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  claimed_by_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  claimed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_founding_slots_claimed_by
  ON founding_slots(claimed_by_user_id) WHERE claimed_by_user_id IS NOT NULL;

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE billing_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_entitlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE founding_slots ENABLE ROW LEVEL SECURITY;

-- Users can only read their own billing data
CREATE POLICY "Users can read own billing_customers"
  ON billing_customers FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can read own user_entitlements"
  ON user_entitlements FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can read founding_slots"
  ON founding_slots FOR SELECT TO authenticated
  USING (true); -- All can see slot counts

-- Service role (webhooks) can update all rows - implicit in service_role key

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Check if user has active Pro or Founding access
CREATE OR REPLACE FUNCTION has_pro_access(user_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  user_plan TEXT;
  user_status TEXT;
  trial_end TIMESTAMPTZ;
  period_end TIMESTAMPTZ;
BEGIN
  SELECT plan, status, trial_ends_at, current_period_ends_at
  INTO user_plan, user_status, trial_end, period_end
  FROM user_entitlements
  WHERE user_id = user_uuid;

  -- Founding members always have access
  IF user_plan = 'founding' AND user_status = 'active' THEN
    RETURN TRUE;
  END IF;

  -- Pro users have access if trialing and not expired
  IF user_plan = 'pro' AND user_status = 'trialing' THEN
    RETURN trial_end IS NOT NULL AND trial_end > NOW();
  END IF;

  -- Pro users have access if active and within period
  IF user_plan = 'pro' AND user_status = 'active' THEN
    RETURN period_end IS NULL OR period_end > NOW();
  END IF;

  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get remaining founding slots
CREATE OR REPLACE FUNCTION get_founding_slots_remaining()
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM founding_slots
    WHERE claimed_by_user_id IS NULL
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get total founding slots
CREATE OR REPLACE FUNCTION get_founding_slots_total()
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM founding_slots
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Claim a founding slot for a user (atomic)
CREATE OR REPLACE FUNCTION claim_founding_slot(user_uuid UUID)
RETURNS JSON AS $$
DECLARE
  slot_id UUID;
  result JSON;
BEGIN
  -- Get first unclaimed slot and claim it in one transaction
  UPDATE founding_slots
  SET claimed_by_user_id = user_uuid, claimed_at = NOW()
  WHERE id = (
    SELECT id FROM founding_slots
    WHERE claimed_by_user_id IS NULL
    LIMIT 1
    FOR UPDATE
  )
  RETURNING id INTO slot_id;

  IF slot_id IS NOT NULL THEN
    -- Create entitlement for founding member
    INSERT INTO user_entitlements (user_id, plan, status)
    VALUES (user_uuid, 'founding', 'active')
    ON CONFLICT (user_id) DO UPDATE
    SET plan = 'founding', status = 'active', updated_at = NOW();

    result := jsonb_build_object(
      'success', true,
      'message', 'Founding slot claimed successfully',
      'slot_id', slot_id
    );
  ELSE
    result := jsonb_build_object(
      'success', false,
      'message', 'No founding slots available'
    );
  END IF;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION has_pro_access(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_founding_slots_remaining() TO authenticated;
GRANT EXECUTE ON FUNCTION get_founding_slots_total() TO authenticated;
GRANT EXECUTE ON FUNCTION claim_founding_slot(UUID) TO authenticated;

-- ============================================================================
-- BACKFILL INITIAL DATA
-- ============================================================================

-- Create initial founding slots (5 spots)
INSERT INTO founding_slots (id) VALUES
  (gen_random_uuid()),
  (gen_random_uuid()),
  (gen_random_uuid()),
  (gen_random_uuid()),
  (gen_random_uuid())
ON CONFLICT DO NOTHING;

-- Create default 'none' entitlements for any existing users without entitlements
INSERT INTO user_entitlements (user_id, plan, status)
SELECT id, 'none', 'none'
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM user_entitlements)
ON CONFLICT (user_id) DO NOTHING;
