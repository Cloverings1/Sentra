import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useHabits } from '../contexts/HabitsContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import { AddHabitModal } from './AddHabitModal';
import { EditHabitModal } from './EditHabitModal';
import { WeekView } from './WeekView';
import { HabitCard } from './HabitCard';
import { TrialBanner } from './TrialBanner';
import { PaywallModal } from './PaywallModal';
import { formatDate } from '../utils/dateUtils';
import type { Habit } from '../types';

interface DashboardProps {
  onNavigate?: (view: 'calendar') => void;
}

export const Dashboard = ({ onNavigate }: DashboardProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const { habits, userName, getCompletionsForDate, completedDays } = useHabits();
  const { isTrialing } = useSubscription();

  // Auto-redirect to calendar after 7 total completions (one-time)
  useEffect(() => {
    const hasSeenCalendar = localStorage.getItem('habits_seen_calendar');
    if (!hasSeenCalendar && completedDays.length >= 7 && onNavigate) {
      localStorage.setItem('habits_seen_calendar', 'true');
      onNavigate('calendar');
    }
  }, [completedDays.length, onNavigate]);

  // Calculate today's progress
  const todayCompletions = getCompletionsForDate(selectedDate);
  const completedToday = habits.filter(h =>
    todayCompletions.some(c => c.habitId === h.id)
  ).length;
  const totalHabits = habits.length;
  const isToday = formatDate(selectedDate) === formatDate(new Date());

  return (
    <div className="main-content">
      {/* Header with greeting, progress, and streak */}
      <header className="flex items-center justify-between mb-6">
        <div className="flex-1">
          <motion.h1
            className="text-display"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
          >
            Hey <span className="font-bold">{userName}!</span>
          </motion.h1>

          {/* Progress indicator */}
          {totalHabits > 0 && (
            <motion.div
              className="flex items-center gap-3 mt-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <span className="text-[13px]" style={{ color: 'var(--text-muted)' }}>
                {isToday ? 'Today' : formatDate(selectedDate)}
              </span>
              <div className="flex items-center gap-2">
                <div
                  className="h-1 rounded-full overflow-hidden"
                  style={{
                    width: 60,
                    background: 'rgba(255, 255, 255, 0.1)',
                  }}
                >
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: 'var(--accent)' }}
                    initial={{ width: 0 }}
                    animate={{ width: `${totalHabits > 0 ? (completedToday / totalHabits) * 100 : 0}%` }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                  />
                </div>
                <span
                  className="text-[13px] font-medium tabular-nums"
                  style={{ color: completedToday === totalHabits && totalHabits > 0 ? 'var(--accent)' : 'var(--text-secondary)' }}
                >
                  {completedToday}/{totalHabits}
                </span>
              </div>
            </motion.div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Calendar shortcut - 1 tap access */}
          {completedDays.length > 0 && onNavigate && (
            <motion.button
              onClick={() => onNavigate('calendar')}
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(255, 255, 255, 0.06)' }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileTap={{ scale: 0.9 }}
              whileHover={{ background: 'rgba(255, 255, 255, 0.1)' }}
              title="View calendar"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-muted)' }}>
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </motion.button>
          )}

          {/* Add habit button - only show when user has habits (empty state has its own CTA) */}
          {habits.length > 0 && (
            <motion.button
              onClick={() => setIsModalOpen(true)}
              className="w-10 h-10 rounded-full flex items-center justify-center text-white"
              style={{ background: 'rgba(255, 255, 255, 0.1)' }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileTap={{ scale: 0.9 }}
              whileHover={{ background: 'rgba(255, 255, 255, 0.15)' }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 5V19M5 12H19" />
              </svg>
            </motion.button>
          )}
        </div>
      </header>

      {/* Trial Banner - shows during active trial */}
      {isTrialing && (
        <TrialBanner onUpgradeClick={() => setShowUpgradeModal(true)} />
      )}

      {/* Date Strip */}
      <WeekView selectedDate={selectedDate} onSelectDate={setSelectedDate} />

      {/* My Habits section */}
      <section className="mt-4">
        {habits.length === 0 ? (
          <motion.div
            className="flex flex-col items-center justify-center text-center"
            style={{ minHeight: 'calc(100vh - 280px)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
          >
            {/* Single clickable affordance - icon + label as one component */}
            <motion.button
              onClick={() => setIsModalOpen(true)}
              className="flex flex-col items-center group"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
              transition={{ duration: 0.2 }}
            >
              <motion.div
                className="w-14 h-14 rounded-full flex items-center justify-center mb-3 transition-all duration-200"
                style={{ background: 'rgba(255, 255, 255, 0.06)' }}
                whileHover={{ background: 'rgba(255, 255, 255, 0.1)' }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--text-primary)' }}>
                  <path d="M12 5V19M5 12H19" />
                </svg>
              </motion.div>
              <span
                className="text-[14px] font-medium transition-colors duration-200"
                style={{ color: 'var(--text-secondary)' }}
              >
                Create habit
              </span>
            </motion.button>

            {/* Supporting text - reduced contrast, calm language */}
            <div className="mt-8 max-w-[240px]">
              <h3
                className="text-[15px] font-medium mb-2"
                style={{ color: 'var(--text-secondary)' }}
              >
                Your first habit starts here
              </h3>
              <p
                className="text-[13px] leading-relaxed"
                style={{ color: 'var(--text-muted)', opacity: 0.8 }}
              >
                Keep it small. Consistency matters more than intensity.
              </p>
            </div>
          </motion.div>
        ) : (
          <>
            {/* Section header - left aligned */}
            <motion.div
              className="flex items-center justify-between mb-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15 }}
            >
              <h2 className="text-[13px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                My Habits
                <span className="ml-2 text-[12px] font-normal" style={{ color: 'var(--text-muted)', opacity: 0.6 }}>
                  {habits.length}
                </span>
              </h2>
            </motion.div>

            {/* Habits list - full width */}
            <div className="w-full relative py-2">
              {habits.map((habit, index) => (
                <HabitCard
                  key={habit.id}
                  habit={habit}
                  index={index}
                  selectedDate={selectedDate}
                  onEdit={setEditingHabit}
                />
              ))}
            </div>

            {/* Add another habit button - full width */}
            <motion.button
              onClick={() => setIsModalOpen(true)}
              className="w-full mt-4 py-3 rounded-xl text-[14px] font-medium flex items-center justify-center gap-2"
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                color: 'var(--text-muted)',
                border: '1px dashed rgba(255, 255, 255, 0.1)',
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              whileHover={{
                background: 'rgba(255, 255, 255, 0.06)',
                borderColor: 'rgba(255, 255, 255, 0.2)',
              }}
              whileTap={{ scale: 0.98 }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5V19M5 12H19" />
              </svg>
              Add habit
            </motion.button>

          </>
        )}
      </section>

      <AddHabitModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      <EditHabitModal
        isOpen={editingHabit !== null}
        onClose={() => setEditingHabit(null)}
        habit={editingHabit}
      />
      <PaywallModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        trigger="habit_limit"
      />
    </div>
  );
};
