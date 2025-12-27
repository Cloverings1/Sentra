-- ============================================================================
-- Migration: 019_webhook_idempotency_status
-- Description: Harden webhook idempotency so events can't get "stuck" as processed
-- Adds a processing state machine: processing | succeeded | failed
-- ============================================================================

ALTER TABLE processed_webhook_events
  ADD COLUMN IF NOT EXISTS status TEXT,
  ADD COLUMN IF NOT EXISTS error TEXT;

-- Backfill status for existing rows
UPDATE processed_webhook_events
SET status = 'succeeded'
WHERE status IS NULL;

ALTER TABLE processed_webhook_events
  ALTER COLUMN status SET DEFAULT 'processing';

ALTER TABLE processed_webhook_events
  DROP CONSTRAINT IF EXISTS processed_webhook_events_status_check;

ALTER TABLE processed_webhook_events
  ADD CONSTRAINT processed_webhook_events_status_check
  CHECK (status IN ('processing', 'succeeded', 'failed'));


