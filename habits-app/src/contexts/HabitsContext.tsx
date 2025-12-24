import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import type { Habit, CompletedDay, RecurrenceType, CustomRecurrence } from '../types';
import { getNextColor } from '../types';
import { supabase } from '../utils/supabase';
import { useAuth } from './AuthContext';
import { formatDate } from '../utils/dateUtils';
import { storage } from '../utils/storage';

// Capitalize first letter of a name
const capitalizeFirstLetter = (name: string): string => {
  if (!name) return name;
  return name.charAt(0).toUpperCase() + name.slice(1);
};

interface HabitsContextType {
  habits: Habit[];
  completedDays: CompletedDay[];
  userName: string;
  loading: boolean;
  addHabit: (name: string, color?: string, recurrence?: RecurrenceType, customDays?: CustomRecurrence) => Promise<void>;
  removeHabit: (id: string) => Promise<void>;
  updateHabit: (id: string, updates: Partial<Habit>) => Promise<void>;
  toggleCompletion: (habitId: string, date?: Date) => Promise<void>;
  isCompleted: (habitId: string, date: Date) => boolean;
  getCompletionsForDate: (date: Date) => CompletedDay[];
  getCompletionsForHabit: (habitId: string) => CompletedDay[];
  getCompletedHabitsForDate: (date: Date, filterHabitId?: string) => Habit[];
  setUserName: (name: string) => void;
  resetAllHabits: () => Promise<void>;
}

const HabitsContext = createContext<HabitsContextType | undefined>(undefined);

export const HabitsProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [completedDays, setCompletedDays] = useState<CompletedDay[]>([]);
  const [userName, setUserNameState] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const fetchHabits = useCallback(async () => {
    if (!user) return;
    try {
      const { data: habitsData, error: habitsError } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (habitsError) throw habitsError;

      const formattedHabits: Habit[] = habitsData.map(h => ({
        id: h.id,
        name: h.name,
        color: h.color,
        createdAt: h.created_at,
        recurrence: h.frequency as RecurrenceType,
        customDays: h.custom_days,
      }));

      setHabits(formattedHabits);

      const { data: completionsData, error: completionsError } = await supabase
        .from('completions')
        .select('*')
        .eq('user_id', user.id);

      if (completionsError) throw completionsError;

      const formattedCompletions: CompletedDay[] = completionsData.map(c => ({
        habitId: c.habit_id,
        date: c.date,
      }));

      setCompletedDays(formattedCompletions);
    } catch (error) {
      console.error('Error fetching habits:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchHabits();
      // Use display_name from user_metadata if available, otherwise fallback to email
      const rawName = user.user_metadata?.display_name || user.email?.split('@')[0] || 'User';
      setUserNameState(capitalizeFirstLetter(rawName));
    } else {
      setHabits([]);
      setCompletedDays([]);
      setLoading(false);
    }
  }, [user, fetchHabits]);

  const addHabit = useCallback(async (name: string, color?: string, recurrence: RecurrenceType = 'daily', customDays?: CustomRecurrence) => {
    if (!user) return;

    const usedColors = habits.map(h => h.color);
    const habitColor = color || getNextColor(usedColors);

    const { data, error } = await supabase
      .from('habits')
      .insert([
        {
          user_id: user.id,
          name,
          color: habitColor,
          frequency: recurrence,
          custom_days: recurrence === 'custom' ? customDays : null,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    const newHabit: Habit = {
      id: data.id,
      name: data.name,
      color: data.color,
      createdAt: data.created_at,
      recurrence: data.frequency as RecurrenceType,
      customDays: data.custom_days,
    };

    setHabits(prev => [...prev, newHabit]);
  }, [user, habits]);

  const removeHabit = useCallback(async (id: string) => {
    if (!user) return;
    const { error } = await supabase
      .from('habits')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;

    setHabits(prev => prev.filter(h => h.id !== id));
    setCompletedDays(prev => prev.filter(c => c.habitId !== id));
  }, [user]);

  const updateHabit = useCallback(async (id: string, updates: Partial<Habit>) => {
    if (!user) return;

    const dbUpdates: Record<string, unknown> = {};
    if (updates.name) dbUpdates.name = updates.name;
    if (updates.color) dbUpdates.color = updates.color;
    if (updates.recurrence) dbUpdates.frequency = updates.recurrence;
    if (updates.customDays) dbUpdates.custom_days = updates.customDays;

    const { error } = await supabase
      .from('habits')
      .update(dbUpdates)
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;

    setHabits(prev => prev.map(h => (h.id === id ? { ...h, ...updates } : h)));
  }, [user]);

  const toggleCompletion = useCallback(async (habitId: string, date: Date = new Date()) => {
    if (!user) return;
    const dateStr = formatDate(date);
    const exists = completedDays.some(
      c => c.habitId === habitId && c.date === dateStr
    );

    if (exists) {
      // Optimistic update - remove immediately for instant feedback
      setCompletedDays(prev => prev.filter(
        c => !(c.habitId === habitId && c.date === dateStr)
      ));

      // Sync to server in background
      const { error } = await supabase
        .from('completions')
        .delete()
        .eq('habit_id', habitId)
        .eq('date', dateStr)
        .eq('user_id', user.id);

      // Revert on error
      if (error) {
        console.error('Failed to uncomplete habit:', error);
        setCompletedDays(prev => [...prev, { habitId, date: dateStr }]);
        throw error;
      }
    } else {
      // Optimistic update - add immediately for instant feedback
      setCompletedDays(prev => [...prev, { habitId, date: dateStr }]);

      // Sync to server in background
      const { error } = await supabase
        .from('completions')
        .insert([
          {
            user_id: user.id,
            habit_id: habitId,
            date: dateStr,
          },
        ]);

      // Revert on error
      if (error) {
        console.error('Failed to complete habit:', error);
        setCompletedDays(prev => prev.filter(
          c => !(c.habitId === habitId && c.date === dateStr)
        ));
        throw error;
      }
    }
  }, [user, completedDays]);

  const isCompleted = useCallback((habitId: string, date: Date): boolean => {
    const dateStr = formatDate(date);
    return completedDays.some(c => c.habitId === habitId && c.date === dateStr);
  }, [completedDays]);

  const getCompletionsForDate = useCallback((date: Date): CompletedDay[] => {
    const dateStr = formatDate(date);
    return completedDays.filter(c => c.date === dateStr);
  }, [completedDays]);

  const getCompletionsForHabit = useCallback((habitId: string): CompletedDay[] => {
    return completedDays.filter(c => c.habitId === habitId);
  }, [completedDays]);

  /**
   * Get completed habits for a specific date
   * Optional filterHabitId to show only that habit if it was completed
   */
  const getCompletedHabitsForDate = useCallback((date: Date, filterHabitId?: string): Habit[] => {
    const completions = getCompletionsForDate(date);

    if (filterHabitId) {
      const habit = habits.find(h => h.id === filterHabitId);
      return completions.some(c => c.habitId === filterHabitId) && habit ? [habit] : [];
    }

    return completions
      .map(c => habits.find(h => h.id === c.habitId))
      .filter((h): h is Habit => h !== undefined);
  }, [habits, getCompletionsForDate]);

  const setUserName = useCallback((name: string) => {
    setUserNameState(capitalizeFirstLetter(name));
  }, []);

  const resetAllHabits = useCallback(async () => {
    if (!user) return;

    // Delete all data from Supabase tables in parallel
    const [habitsDelete, completionsDelete, streaksDelete] = await Promise.all([
      supabase.from('habits').delete().eq('user_id', user.id),
      supabase.from('completions').delete().eq('user_id', user.id),
      supabase.from('broken_streaks').delete().eq('user_id', user.id),
    ]);

    // Check for errors
    if (habitsDelete.error) throw habitsDelete.error;
    if (completionsDelete.error) throw completionsDelete.error;
    if (streaksDelete.error) throw streaksDelete.error;

    // Clear localStorage
    storage.clearAll();

    // Reset React state
    setHabits([]);
    setCompletedDays([]);
  }, [user]);

  return (
    <HabitsContext.Provider
      value={{
        habits,
        completedDays,
        userName,
        loading,
        addHabit,
        removeHabit,
        updateHabit,
        toggleCompletion,
        isCompleted,
        getCompletionsForDate,
        getCompletionsForHabit,
        getCompletedHabitsForDate,
        setUserName,
        resetAllHabits,
      }}
    >
      {children}
    </HabitsContext.Provider>
  );
};

export const useHabits = (): HabitsContextType => {
  const context = useContext(HabitsContext);
  if (!context) {
    throw new Error('useHabits must be used within a HabitsProvider');
  }
  return context;
};
