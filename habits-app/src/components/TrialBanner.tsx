import { motion } from 'framer-motion';
import { useSubscription } from '../contexts/SubscriptionContext';
import { Clock, Sparkles } from 'lucide-react';

interface TrialBannerProps {
  onUpgradeClick: () => void;
}

export const TrialBanner = ({ onUpgradeClick }: TrialBannerProps) => {
  const { isTrialing, trialState } = useSubscription();

  // Only show for active (non-expired) trials
  if (!isTrialing || !trialState || trialState.isExpired) {
    return null;
  }

  const { daysRemaining } = trialState;

  // Determine urgency styling
  const isUrgent = daysRemaining <= 2;
  const isModerate = daysRemaining <= 4 && daysRemaining > 2;

  const getBannerStyle = () => {
    if (isUrgent) {
      return {
        background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.12), rgba(239, 68, 68, 0.06))',
        border: '1px solid rgba(239, 68, 68, 0.2)',
        iconColor: '#ef4444',
        textColor: '#fca5a5',
      };
    }
    if (isModerate) {
      return {
        background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.12), rgba(251, 191, 36, 0.06))',
        border: '1px solid rgba(251, 191, 36, 0.2)',
        iconColor: '#fbbf24',
        textColor: '#fde68a',
      };
    }
    // Default - calm
    return {
      background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.1), rgba(139, 92, 246, 0.05))',
      border: '1px solid rgba(6, 182, 212, 0.15)',
      iconColor: '#06b6d4',
      textColor: '#a5f3fc',
    };
  };

  const style = getBannerStyle();

  const getDaysText = () => {
    if (daysRemaining === 0) return 'Trial ends today';
    if (daysRemaining === 1) return '1 day left in trial';
    return `${daysRemaining} days left in trial`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
      className="mb-4 px-4 py-3 rounded-2xl flex items-center justify-between"
      style={{
        background: style.background,
        border: style.border,
      }}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(255, 255, 255, 0.08)' }}
        >
          <Clock size={16} style={{ color: style.iconColor }} />
        </div>
        <div>
          <p className="text-[13px] font-medium" style={{ color: style.textColor }}>
            {getDaysText()}
          </p>
          <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
            Subscribe to keep your progress
          </p>
        </div>
      </div>

      <motion.button
        onClick={onUpgradeClick}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium transition-all"
        style={{
          background: 'rgba(255, 255, 255, 0.1)',
          color: 'var(--text-primary)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
        whileHover={{
          scale: 1.02,
          background: 'rgba(255, 255, 255, 0.15)',
        }}
        whileTap={{ scale: 0.98 }}
      >
        <Sparkles size={12} />
        Upgrade
      </motion.button>
    </motion.div>
  );
};
