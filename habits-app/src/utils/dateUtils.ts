// Date utility functions for habit tracking

export const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

export const parseDate = (dateStr: string): Date => {
  return new Date(dateStr + 'T00:00:00');
};

/**
 * Get yesterday's date using proper date arithmetic (handles DST, timezones)
 */
export const getYesterday = (): Date => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday;
};

export const getWeekDays = (date: Date): Date[] => {
  const day = date.getDay();
  const diff = date.getDate() - day;
  const weekStart = new Date(date);
  weekStart.setDate(diff);

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return d;
  });
};

export const getMonthDays = (year: number, month: number): (Date | null)[] => {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const dayOfWeek = firstDay.getDay();
  const startingDay = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

  const days: (Date | null)[] = [];

  for (let i = 0; i < startingDay; i++) {
    days.push(null);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    days.push(new Date(year, month, day));
  }

  return days;
};

export const isSameDay = (date1: Date, date2: Date): boolean => {
  return formatDate(date1) === formatDate(date2);
};

export const isToday = (date: Date): boolean => {
  return isSameDay(date, new Date());
};

export const getDayName = (date: Date, short: boolean = true): string => {
  const options: Intl.DateTimeFormatOptions = { weekday: short ? 'short' : 'long' };
  return date.toLocaleDateString('en-US', options);
};

export const getMonthName = (date: Date, short: boolean = false): string => {
  const options: Intl.DateTimeFormatOptions = { month: short ? 'short' : 'long' };
  return date.toLocaleDateString('en-US', options);
};

/**
 * Core streak calculation from sorted date strings (DRY helper)
 * Counts consecutive days backwards from most recent date
 */
const calculateStreakFromDates = (sortedDates: string[]): number => {
  if (sortedDates.length === 0) return 0;

  const today = formatDate(new Date());
  const yesterday = formatDate(getYesterday());

  // Streak must include today or yesterday to be "current"
  if (sortedDates[0] !== today && sortedDates[0] !== yesterday) {
    return 0;
  }

  let streak = 1;
  let currentDate = parseDate(sortedDates[0]);

  for (let i = 1; i < sortedDates.length; i++) {
    const prevDate = new Date(currentDate);
    prevDate.setDate(prevDate.getDate() - 1);

    if (formatDate(prevDate) === sortedDates[i]) {
      streak++;
      currentDate = prevDate;
    } else {
      break;
    }
  }

  return streak;
};

/**
 * Calculate streak for a specific habit or from a list of dates
 */
export const calculateStreak = (
  completedDays: string[],
  habitId?: string,
  allCompletions?: { habitId: string; date: string }[]
): number => {
  const dates = habitId && allCompletions
    ? allCompletions.filter(c => c.habitId === habitId).map(c => c.date)
    : completedDays;

  if (dates.length === 0) return 0;

  const sortedDates = [...dates].sort((a, b) => b.localeCompare(a));
  return calculateStreakFromDates(sortedDates);
};

export const getWeekNumber = (date: Date): number => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const msPerDay = 86400000;
  return Math.ceil((((d.getTime() - yearStart.getTime()) / msPerDay) + 1) / 7);
};

export const getWeekStreakCount = (
  completedDays: { habitId: string; date: string }[]
): number => {
  if (completedDays.length === 0) return 0;

  const uniqueDates = [...new Set(completedDays.map(c => c.date))].sort((a, b) => b.localeCompare(a));

  let weekStreak = 0;
  let currentWeek = getWeekNumber(new Date());
  let currentYear = new Date().getFullYear();

  for (const dateStr of uniqueDates) {
    const date = parseDate(dateStr);
    const week = getWeekNumber(date);
    const year = date.getFullYear();

    if (year === currentYear && week === currentWeek) {
      if (weekStreak === 0) weekStreak = 1;
    } else if (
      (year === currentYear && week === currentWeek - 1) ||
      (year === currentYear - 1 && currentWeek === 1 && week >= 52)
    ) {
      weekStreak++;
      currentWeek = week;
      currentYear = year;
    } else {
      break;
    }
  }

  return weekStreak;
};

/**
 * Calculate global streak - consecutive days with at least one habit completion
 */
export const calculateGlobalStreak = (
  completedDays: { habitId: string; date: string }[]
): number => {
  if (completedDays.length === 0) return 0;

  const uniqueDates = [...new Set(completedDays.map(c => c.date))].sort((a, b) => b.localeCompare(a));
  return calculateStreakFromDates(uniqueDates);
};

/**
 * Count unique days with at least one completion in the current week (Mon-Sun)
 */
export const getWeekCompletionCount = (
  completedDays: { habitId: string; date: string }[]
): number => {
  const today = new Date();
  const weekDays = getWeekDays(today);
  const weekStart = formatDate(weekDays[0]);
  const weekEnd = formatDate(weekDays[6]);

  const uniqueDates = new Set(completedDays.map(c => c.date));
  let count = 0;

  for (const dateStr of uniqueDates) {
    if (dateStr >= weekStart && dateStr <= weekEnd) {
      count++;
    }
  }

  return count;
};
