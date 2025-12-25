import { useAuth } from '../contexts/AuthContext';
import { useEntitlement } from '../contexts/EntitlementContext';

interface TrialGuardProps {
  children: React.ReactNode;
}

/**
 * TrialGuard now allows users into the app regardless of subscription status.
 * The paywall is shown when they try to interact (toggle habit, add habit, etc.)
 * This provides a better UX - users can see their data before being asked to pay.
 */
export const TrialGuard = ({ children }: TrialGuardProps) => {
  const { user } = useAuth();
  const { loading } = useEntitlement();

  // Show nothing while loading auth/entitlement
  if (loading || !user) return null;

  // Always render the app - paywall is triggered on interaction
  return <>{children}</>;
};
