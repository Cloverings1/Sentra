-- ============================================================================
-- Migration: 018_add_feedback_ticket_fields
-- Description: Align user_feedback schema with frontend ticket model
-- Adds: title, status, page (and status constraint/backfill)
-- ============================================================================

-- Add missing columns (idempotent)
ALTER TABLE user_feedback
  ADD COLUMN IF NOT EXISTS title TEXT,
  ADD COLUMN IF NOT EXISTS status TEXT,
  ADD COLUMN IF NOT EXISTS page TEXT;

-- Backfill status for existing rows
UPDATE user_feedback
SET status = 'open'
WHERE status IS NULL;

-- Set default for new rows
ALTER TABLE user_feedback
  ALTER COLUMN status SET DEFAULT 'open';

-- Constrain status values
ALTER TABLE user_feedback
  DROP CONSTRAINT IF EXISTS user_feedback_status_check;

ALTER TABLE user_feedback
  ADD CONSTRAINT user_feedback_status_check
  CHECK (status IN ('open', 'in_progress', 'resolved'));


