import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useHabits } from '../contexts/HabitsContext';
import { getMonthDays, isToday, getWeekStreakCount } from '../utils/dateUtils';
import { CompletionDots } from './CompletionDots';
import type { Habit } from '../types';

const WEEKDAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const Calendar = () => {
  const { habits, completedDays, getCompletedHabitsForDate } = useHabits();
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);
  const weekStreak = getWeekStreakCount(completedDays);

  const months = useMemo(() => {
    const result = [];
    const now = new Date();
    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      result.push({ year: date.getFullYear(), month: date.getMonth() });
    }
    return result;
  }, []);

  return (
    <div className="main-content">
      {/* Streak header */}
      <motion.div
        className="mb-16"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="stat-number">{weekStreak}</div>
        <div className="stat-label">week streak</div>
      </motion.div>

      {/* Habit filter */}
      {habits.length > 0 && (
        <motion.div
          className="flex items-center gap-4 mb-12 flex-wrap"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <button
            onClick={() => setSelectedHabit(null)}
            className="text-[13px] transition-colors"
            style={{ color: !selectedHabit ? 'var(--text-primary)' : 'var(--text-muted)' }}
          >
            All
          </button>
          {habits.map(habit => (
            <button
              key={habit.id}
              onClick={() => setSelectedHabit(habit)}
              className="flex items-center gap-2 text-[13px] transition-colors"
              style={{ color: selectedHabit?.id === habit.id ? 'var(--text-primary)' : 'var(--text-muted)' }}
            >
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: habit.color }} />
              {habit.name}
            </button>
          ))}
        </motion.div>
      )}

      {/* Calendar months */}
      <div className="space-y-16">
        {months.map(({ year, month }, monthIndex) => {
          const days = getMonthDays(year, month);
          const today = new Date();
          const isCurrentMonth = today.getMonth() === month && today.getFullYear() === year;
          const currentDay = isCurrentMonth ? today.getDate() : null;

          return (
            <motion.div
              key={`${year}-${month}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: monthIndex * 0.03 }}
            >
              {/* Month header */}
              <div className="month-header">
                {isCurrentMonth && <div className="month-dot" />}
                <span className="month-name">{MONTHS[month]}</span>
                {currentDay && <span className="month-day">{currentDay}</span>}
              </div>

              {/* Weekday headers */}
              <div className="cal-grid mb-4">
                {WEEKDAYS.map((day, i) => (
                  <div key={i} className="cal-cell">
                    <span className="cal-header">{day}</span>
                  </div>
                ))}
              </div>

              {/* Days grid */}
              <div className="cal-grid">
                {days.map((day, index) => {
                  if (!day) {
                    return <div key={`empty-${index}`} className="cal-cell" />;
                  }

                  const isTodayDate = isToday(day);
                  // Use shared function with optional filter
                  const completedHabits = getCompletedHabitsForDate(day, selectedHabit?.id);
                  const hasCompletions = completedHabits.length > 0;

                  return (
                    <div
                      key={day.toISOString()}
                      className="cal-cell flex-col transition-opacity duration-200"
                      style={{
                        // Fade empty days, normal for completed
                        opacity: hasCompletions ? 1 : 0.4,
                      }}
                    >
                      {/* Completion dots above the day indicator */}
                      {hasCompletions && (
                        <CompletionDots
                          habits={completedHabits}
                          size={6}
                          maxVisible={5}
                          overlapPercent={35}
                          className="mb-0.5"
                        />
                      )}

                      {/* Day indicator dot - subtle glow for completed days */}
                      <div
                        className="cal-dot"
                        style={{
                          backgroundColor: isTodayDate
                            ? 'var(--dot-active)'
                            : hasCompletions
                              ? 'rgba(255, 255, 255, 0.3)'
                              : undefined,
                          boxShadow: hasCompletions && !isTodayDate
                            ? '0 0 8px rgba(255, 255, 255, 0.15)'
                            : undefined,
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
