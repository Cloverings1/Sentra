import { motion } from 'framer-motion';
import type { Habit } from '../types';

interface CompletionDotsProps {
  habits: Habit[];
  size?: number;
  maxVisible?: number;
  overlapPercent?: number;
  className?: string;
}

/**
 * Renders colored dots for completed habits
 * - Shows individual dots for 1-3 habits
 * - Overlaps dots by 30-40% when more than 3
 */
export const CompletionDots = ({
  habits,
  size = 6,
  maxVisible = 5,
  overlapPercent = 35,
  className = '',
}: CompletionDotsProps) => {
  if (habits.length === 0) return null;

  const visibleHabits = habits.slice(0, maxVisible);
  const hasOverflow = habits.length > maxVisible;
  const shouldOverlap = habits.length > 3;

  // Calculate overlap margin (negative) based on size and percentage
  const overlapMargin = shouldOverlap ? -(size * overlapPercent) / 100 : 0;

  return (
    <div
      className={`flex items-center justify-center ${className}`}
      style={{ minHeight: size + 4 }}
    >
      <div className="flex items-center">
        {visibleHabits.map((habit, idx) => (
          <motion.div
            key={habit.id}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: idx * 0.03, duration: 0.2 }}
            className="rounded-full"
            style={{
              width: size,
              height: size,
              backgroundColor: habit.color,
              marginLeft: idx === 0 ? 0 : shouldOverlap ? overlapMargin : 2,
              zIndex: visibleHabits.length - idx,
              boxShadow: shouldOverlap ? `0 0 0 1px rgba(11, 11, 11, 0.8)` : 'none',
            }}
          />
        ))}
        {hasOverflow && (
          <span
            className="text-white/40 font-medium"
            style={{
              fontSize: size * 0.8,
              marginLeft: 4,
            }}
          >
            +{habits.length - maxVisible}
          </span>
        )}
      </div>
    </div>
  );
};
