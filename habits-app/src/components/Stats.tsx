import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useHabits } from '../contexts/HabitsContext';
import { calculateStreak, parseDate } from '../utils/dateUtils';
import type { Habit, CompletedDay } from '../types';

interface BrokenStreak {
  endDate: string;
  length: number;
}

const calculateMissedDays = (habit: Habit, completions: CompletedDay[]): number => {
  const createdAt = parseDate(habit.createdAt.split('T')[0]);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Calculate expected days based on recurrence
  let expectedDays = 0;
  const current = new Date(createdAt);

  while (current <= today) {
    const dayOfWeek = current.getDay();
    const dayName = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][dayOfWeek] as keyof NonNullable<typeof habit.customDays>;

    let shouldCount = false;

    if (habit.recurrence === 'daily') {
      shouldCount = true;
    } else if (habit.recurrence === 'weekly') {
      // Weekly defaults to Monday
      shouldCount = dayOfWeek === 1;
    } else if (habit.recurrence === 'custom' && habit.customDays) {
      shouldCount = habit.customDays[dayName];
    }

    if (shouldCount) expectedDays++;
    current.setDate(current.getDate() + 1);
  }

  const actualCompletions = completions.filter(c => c.habitId === habit.id).length;
  return Math.max(0, expectedDays - actualCompletions);
};

const findBrokenStreaks = (habitId: string, completions: CompletedDay[]): BrokenStreak[] => {
  const habitCompletions = completions
    .filter(c => c.habitId === habitId)
    .map(c => c.date)
    .sort((a, b) => a.localeCompare(b));

  if (habitCompletions.length < 2) return [];

  const brokenStreaks: BrokenStreak[] = [];
  let currentStreakLength = 1;

  for (let i = 1; i < habitCompletions.length; i++) {
    const prevDate = parseDate(habitCompletions[i - 1]);
    const currDate = parseDate(habitCompletions[i]);
    const diffDays = Math.round((currDate.getTime() - prevDate.getTime()) / 86400000);

    if (diffDays === 1) {
      currentStreakLength++;
    } else if (diffDays > 1) {
      // Streak was broken - only record if it was a meaningful streak (3+ days)
      if (currentStreakLength >= 3) {
        brokenStreaks.push({
          endDate: habitCompletions[i - 1],
          length: currentStreakLength,
        });
      }
      currentStreakLength = 1;
    }
  }

  // Return most recent broken streaks (up to 3)
  return brokenStreaks.slice(-3).reverse();
};

const formatBrokenStreakDate = (dateStr: string): string => {
  const date = parseDate(dateStr);
  const now = new Date();
  const diffDays = Math.round((now.getTime() - date.getTime()) / 86400000);

  if (diffDays === 1) return 'yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export const Stats = () => {
  const { habits, completedDays } = useHabits();

  const stats = useMemo(() => {
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const habitStats = habits.map((habit) => {
      const habitCompletions = completedDays.filter((c) => c.habitId === habit.id);
      const streak = calculateStreak(habitCompletions.map((c) => c.date));

      const last30Days = habitCompletions.filter((c) => {
        const date = new Date(c.date);
        return date >= thirtyDaysAgo && date <= today;
      });
      const completionRate = Math.round((last30Days.length / 30) * 100);

      // Reality check data
      const missedDays = calculateMissedDays(habit, completedDays);
      const brokenStreaks = findBrokenStreaks(habit.id, completedDays);

      return {
        habit,
        streak,
        completionRate,
        totalCompletions: habitCompletions.length,
        missedDays,
        brokenStreaks,
      };
    });

    const totalCompletions = completedDays.length;
    const uniqueDays = new Set(completedDays.map((c) => c.date)).size;
    const bestStreak = Math.max(...habitStats.map((s) => s.streak), 0);

    return { habitStats, totalCompletions, uniqueDays, bestStreak };
  }, [habits, completedDays]);

  return (
    <div className="main-content">
      {/* Key Stats - Large numbers */}
      <motion.div
        className="mb-16"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="stat-number">{stats.bestStreak}</div>
        <div className="stat-label">day best streak</div>
      </motion.div>

      {/* Stats grid */}
      <motion.div
        className="grid grid-cols-3 gap-16 mb-16"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <div>
          <div className="text-[32px] font-medium tracking-tight" style={{ color: 'var(--text-primary)' }}>
            {stats.totalCompletions}
          </div>
          <div className="text-[13px] mt-1" style={{ color: 'var(--text-muted)' }}>
            total check-ins
          </div>
        </div>
        <div>
          <div className="text-[32px] font-medium tracking-tight" style={{ color: 'var(--text-primary)' }}>
            {stats.uniqueDays}
          </div>
          <div className="text-[13px] mt-1" style={{ color: 'var(--text-muted)' }}>
            active days
          </div>
        </div>
        <div>
          <div className="text-[32px] font-medium tracking-tight" style={{ color: 'var(--text-primary)' }}>
            {habits.length}
          </div>
          <div className="text-[13px] mt-1" style={{ color: 'var(--text-muted)' }}>
            habits
          </div>
        </div>
      </motion.div>

      {/* Insights - personal language */}
      {stats.habitStats.length > 0 && (
        <section>
          <h2 className="text-title mb-4">Insights</h2>
          <p className="text-[14px] mb-8" style={{ color: 'var(--text-muted)' }}>
            {stats.bestStreak >= 7
              ? "You're building something real."
              : stats.bestStreak >= 3
                ? "Consistency is starting to show."
                : "Every day you show up matters."}
          </p>
          <div className="space-y-6 max-w-xl">
            {stats.habitStats.map((stat, i) => (
              <motion.div
                key={stat.habit.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 + i * 0.05 }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: stat.habit.color }} />
                    <span className="text-[15px]" style={{ color: 'var(--text-primary)' }}>
                      {stat.habit.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-6 text-[12px]" style={{ color: 'var(--text-muted)' }}>
                    <span>{stat.streak}d streak</span>
                    <span>{stat.completionRate}%</span>
                  </div>
                </div>
                <div className="progress-bar">
                  <motion.div
                    className="progress-fill"
                    style={{ backgroundColor: stat.habit.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${stat.completionRate}%` }}
                    transition={{ duration: 0.6, delay: 0.3 + i * 0.05 }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Reality Check Section - with forgiveness messaging */}
      {stats.habitStats.length > 0 && stats.habitStats.some(s => s.missedDays > 0 || s.brokenStreaks.length > 0) && (
        <motion.section
          className="mt-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-metadata mb-4">Reality Check</h2>
          <p className="text-[13px] mb-8" style={{ color: 'var(--text-muted)' }}>
            Missed days are part of the process. You can always start again.
          </p>
          <div className="space-y-5 max-w-xl">
            {stats.habitStats.map((stat, i) => {
              if (stat.missedDays === 0 && stat.brokenStreaks.length === 0) return null;

              return (
                <motion.div
                  key={`reality-${stat.habit.id}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.45 + i * 0.05 }}
                  className="py-4 border-b"
                  style={{ borderColor: 'rgba(255, 255, 255, 0.06)' }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: stat.habit.color }} />
                    <span className="text-[14px]" style={{ color: 'var(--text-primary)' }}>
                      {stat.habit.name}
                    </span>
                  </div>

                  <div className="pl-5 space-y-2">
                    {stat.missedDays > 0 && (
                      <p className="text-[13px]" style={{ color: 'var(--text-muted)' }}>
                        {stat.missedDays} missed days
                      </p>
                    )}

                    {stat.brokenStreaks.map((brokenStreak, idx) => (
                      <p
                        key={`${stat.habit.id}-broken-${idx}`}
                        className="text-[13px]"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        {brokenStreak.length}-day streak ended {formatBrokenStreakDate(brokenStreak.endDate)}
                      </p>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.section>
      )}

      {stats.habitStats.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <p className="text-[15px] mb-2" style={{ color: 'var(--text-primary)' }}>
            No habits yet
          </p>
          <p className="text-[13px]" style={{ color: 'var(--text-muted)' }}>
            Create habits to see your statistics
          </p>
        </motion.div>
      )}
    </div>
  );
};
