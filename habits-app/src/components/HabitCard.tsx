import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Habit } from '../types';
import { useHabits } from '../contexts/HabitsContext';

const LONG_PRESS_DURATION = 1500; // 1.5 seconds
const LONG_PRESS_VISUAL_DELAY = 150; // Only show progress bar after this threshold

interface HabitCardProps {
  habit: Habit;
  index: number;
  selectedDate: Date;
  onEdit?: (habit: Habit) => void;
}

export const HabitCard = ({ habit, index, selectedDate, onEdit }: HabitCardProps) => {
  const { isCompleted, toggleCompletion } = useHabits();
  const completed = isCompleted(habit.id, selectedDate);
  const [isPending, setIsPending] = useState(false);

  // Long press state
  const [isLongPressing, setIsLongPressing] = useState(false);
  const [longPressProgress, setLongPressProgress] = useState(0);
  const visualDelayTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const editTriggerTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progressInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const pressStartTime = useRef<number>(0);

  const clearLongPress = useCallback(() => {
    if (visualDelayTimer.current) {
      clearTimeout(visualDelayTimer.current);
      visualDelayTimer.current = null;
    }
    if (editTriggerTimer.current) {
      clearTimeout(editTriggerTimer.current);
      editTriggerTimer.current = null;
    }
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
      progressInterval.current = null;
    }
    setIsLongPressing(false);
    setLongPressProgress(0);
  }, []);

  const startLongPress = useCallback(() => {
    pressStartTime.current = Date.now();
    setLongPressProgress(0);

    // Only show visual feedback after threshold (so quick taps don't flash the bar)
    visualDelayTimer.current = setTimeout(() => {
      setIsLongPressing(true);

      // Start progress bar animation after visual delay
      progressInterval.current = setInterval(() => {
        const elapsed = Date.now() - pressStartTime.current - LONG_PRESS_VISUAL_DELAY;
        const adjustedDuration = LONG_PRESS_DURATION - LONG_PRESS_VISUAL_DELAY;
        const progress = Math.min((elapsed / adjustedDuration) * 100, 100);
        setLongPressProgress(progress);
      }, 16); // ~60fps
    }, LONG_PRESS_VISUAL_DELAY);

    // Trigger edit after full duration
    editTriggerTimer.current = setTimeout(() => {
      clearLongPress();
      if (onEdit) {
        // Add haptic feedback if available
        if (navigator.vibrate) {
          navigator.vibrate(10);
        }
        onEdit(habit);
      }
    }, LONG_PRESS_DURATION);
  }, [habit, onEdit, clearLongPress]);

  const handlePointerDown = (e: React.PointerEvent) => {
    // Only start long press for primary button (left click / touch)
    if (e.button !== 0) return;
    startLongPress();
  };

  const handlePointerUp = () => {
    const wasLongPressing = isLongPressing;
    const elapsed = Date.now() - pressStartTime.current;
    clearLongPress();

    // If it was a short tap (not a long press attempt), toggle completion
    if (!wasLongPressing || elapsed < 200) {
      handleClick();
    }
  };

  const handlePointerLeave = () => {
    clearLongPress();
  };

  const handleClick = async () => {
    if (isPending) return;
    setIsPending(true);

    try {
      await toggleCompletion(habit.id, selectedDate);
    } catch (error) {
      console.error('Failed to toggle habit:', error);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <motion.div
      className="relative flex items-center justify-between px-5 py-4 rounded-2xl cursor-pointer select-none overflow-hidden"
      style={{
        marginTop: index === 0 ? 0 : 8,
        background: completed
          ? `rgba(255, 255, 255, 0.03)`
          : 'rgba(255, 255, 255, 0.06)',
        // Subtle inner glow when completed
        boxShadow: completed
          ? `inset 0 0 20px ${habit.color}15, 0 0 0 1px ${habit.color}20`
          : 'none',
      }}
      initial={{ opacity: 0, y: 8 }}
      animate={{
        opacity: isPending ? 0.6 : 1,
        y: 0,
        scale: isPending ? 0.98 : isLongPressing ? 0.97 : 1,
      }}
      transition={{
        duration: 0.2,
        delay: index * 0.03,
        ease: [0.32, 0.72, 0, 1],
      }}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerLeave}
      onPointerCancel={handlePointerLeave}
    >
      {/* Long press progress bar - bottom edge */}
      <AnimatePresence>
        {isLongPressing && (
          <motion.div
            className="absolute bottom-0 left-0 h-[2px]"
            style={{
              background: habit.color,
              width: `${longPressProgress}%`,
              boxShadow: `0 0 8px ${habit.color}80`,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          />
        )}
      </AnimatePresence>

      {/* Habit name - the only text */}
      <span
        className="text-[16px] font-medium"
        style={{
          color: completed ? 'var(--text-muted)' : 'var(--text-primary)',
          transition: 'color 0.2s ease',
        }}
      >
        {habit.name}
      </span>

      {/* Completion indicator - soft colored dot */}
      <motion.div
        className="w-3 h-3 rounded-full"
        style={{
          backgroundColor: completed ? habit.color : 'rgba(255, 255, 255, 0.1)',
          boxShadow: completed ? `0 0 12px ${habit.color}60` : 'none',
        }}
        animate={{
          scale: completed ? 1 : 0.8,
          opacity: completed ? 1 : 0.4,
        }}
        transition={{
          type: 'spring',
          stiffness: 400,
          damping: 25,
        }}
      />
    </motion.div>
  );
};
