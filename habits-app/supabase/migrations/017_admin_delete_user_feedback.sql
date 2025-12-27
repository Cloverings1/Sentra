-- ============================================================================
-- Migration: 017_admin_delete_user_feedback
-- Description: Allow feedback admin to delete tickets (cleanup after resolving)
-- ============================================================================

-- Ensure RLS is enabled (idempotent)
ALTER TABLE user_feedback ENABLE ROW LEVEL SECURITY;

-- Admin can delete feedback (permanently)
DROP POLICY IF EXISTS "Admin can delete all feedback" ON user_feedback;
CREATE POLICY "Admin can delete all feedback"
  ON user_feedback
  FOR DELETE
  TO authenticated
  USING (is_feedback_admin());


