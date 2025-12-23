import { motion } from 'framer-motion';
import { useHabits } from '../contexts/HabitsContext';
import { calculateGlobalStreak } from '../utils/dateUtils';

interface GlobalStreakProps {
  variant?: 'compact' | 'full';
  className?: string;
}

/**
 * Displays global streak across all habits
 * - compact: small pill with fire icon + number
 * - full: larger display with label
 */
export const GlobalStreak = ({ variant = 'compact', className = '' }: GlobalStreakProps) => {
  const { completedDays } = useHabits();
  const streak = calculateGlobalStreak(completedDays);

  if (variant === 'full') {
    return (
      <motion.div
        className={className}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="stat-number">{streak}</div>
        <div className="stat-label">day streak</div>
      </motion.div>
    );
  }

  // Compact variant
  return (
    <motion.div
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${className}`}
      style={{
        background: streak > 0 ? 'rgba(232, 93, 79, 0.15)' : 'rgba(255, 255, 255, 0.05)',
      }}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
    >
      <span style={{ fontSize: 14 }}>
        {streak > 0 ? '🔥' : '💤'}
      </span>
      <span
        className="text-[13px] font-semibold tabular-nums"
        style={{ color: streak > 0 ? 'var(--accent)' : 'var(--text-muted)' }}
      >
        {streak}
      </span>
    </motion.div>
  );
};
