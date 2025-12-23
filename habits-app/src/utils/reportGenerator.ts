import { jsPDF } from 'jspdf';
import type { Habit, CompletedDay } from '../types';
import { formatDate, parseDate } from './dateUtils';

export interface HabitReportData {
  habit: Habit;
  completionRate: number;
  completedCount: number;
  expectedCount: number;
  currentStreak: number;
  longestStreak: number;
}

export interface ConsistencyReportData {
  periodLabel: string;
  periodStart: Date;
  periodEnd: Date;
  totalHabits: number;
  overallCompletionRate: number;
  longestActiveStreak: number;
  daysWithMissedHabits: number;
  totalExpectedCompletions: number;
  totalActualCompletions: number;
  habitBreakdown: HabitReportData[];
}

const calculateExpectedDays = (
  habit: Habit,
  periodStart: Date,
  periodEnd: Date
): number => {
  const createdAt = parseDate(habit.createdAt.split('T')[0]);
  const effectiveStart = createdAt > periodStart ? createdAt : periodStart;

  if (effectiveStart > periodEnd) return 0;

  let count = 0;
  const current = new Date(effectiveStart);

  while (current <= periodEnd) {
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

    if (shouldCount) count++;
    current.setDate(current.getDate() + 1);
  }

  return count;
};

const calculateCompletionsInPeriod = (
  habitId: string,
  completions: CompletedDay[],
  periodStart: Date,
  periodEnd: Date
): number => {
  const startStr = formatDate(periodStart);
  const endStr = formatDate(periodEnd);

  return completions.filter(c =>
    c.habitId === habitId &&
    c.date >= startStr &&
    c.date <= endStr
  ).length;
};

const calculateStreakInPeriod = (
  habitId: string,
  completions: CompletedDay[],
  periodEnd: Date
): number => {
  const habitCompletions = completions
    .filter(c => c.habitId === habitId)
    .map(c => c.date)
    .sort((a, b) => b.localeCompare(a));

  if (habitCompletions.length === 0) return 0;

  const endStr = formatDate(periodEnd);
  const today = formatDate(new Date());
  const yesterday = formatDate(new Date(Date.now() - 86400000));

  // Find the most recent completion
  const mostRecent = habitCompletions[0];
  if (mostRecent !== today && mostRecent !== yesterday && mostRecent > endStr) {
    return 0;
  }

  let streak = 1;
  let currentDate = parseDate(habitCompletions[0]);

  for (let i = 1; i < habitCompletions.length; i++) {
    const prevDate = new Date(currentDate);
    prevDate.setDate(prevDate.getDate() - 1);

    if (formatDate(prevDate) === habitCompletions[i]) {
      streak++;
      currentDate = prevDate;
    } else {
      break;
    }
  }

  return streak;
};

const calculateLongestStreak = (
  habitId: string,
  completions: CompletedDay[]
): number => {
  const habitCompletions = completions
    .filter(c => c.habitId === habitId)
    .map(c => c.date)
    .sort((a, b) => a.localeCompare(b));

  if (habitCompletions.length === 0) return 0;

  let longestStreak = 1;
  let currentStreak = 1;

  for (let i = 1; i < habitCompletions.length; i++) {
    const prevDate = parseDate(habitCompletions[i - 1]);
    const currDate = parseDate(habitCompletions[i]);

    const diffDays = Math.round((currDate.getTime() - prevDate.getTime()) / 86400000);

    if (diffDays === 1) {
      currentStreak++;
      longestStreak = Math.max(longestStreak, currentStreak);
    } else {
      currentStreak = 1;
    }
  }

  return longestStreak;
};

export const generateReportData = (
  habits: Habit[],
  completions: CompletedDay[],
  period: 'weekly' | 'monthly'
): ConsistencyReportData => {
  const now = new Date();
  const periodEnd = new Date(now);
  periodEnd.setHours(23, 59, 59, 999);

  const periodStart = new Date(now);
  if (period === 'weekly') {
    periodStart.setDate(periodStart.getDate() - 7);
  } else {
    periodStart.setDate(periodStart.getDate() - 30);
  }
  periodStart.setHours(0, 0, 0, 0);

  const periodLabel = period === 'weekly'
    ? `Week of ${periodStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${periodEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
    : `${periodStart.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} - ${periodEnd.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`;

  const habitBreakdown: HabitReportData[] = habits.map(habit => {
    const expectedCount = calculateExpectedDays(habit, periodStart, periodEnd);
    const completedCount = calculateCompletionsInPeriod(habit.id, completions, periodStart, periodEnd);
    const completionRate = expectedCount > 0 ? Math.round((completedCount / expectedCount) * 100) : 0;
    const currentStreak = calculateStreakInPeriod(habit.id, completions, periodEnd);
    const longestStreak = calculateLongestStreak(habit.id, completions);

    return {
      habit,
      completionRate,
      completedCount,
      expectedCount,
      currentStreak,
      longestStreak,
    };
  });

  const totalExpectedCompletions = habitBreakdown.reduce((sum, h) => sum + h.expectedCount, 0);
  const totalActualCompletions = habitBreakdown.reduce((sum, h) => sum + h.completedCount, 0);
  const overallCompletionRate = totalExpectedCompletions > 0
    ? Math.round((totalActualCompletions / totalExpectedCompletions) * 100)
    : 0;

  const longestActiveStreak = Math.max(...habitBreakdown.map(h => h.currentStreak), 0);

  // Calculate missed check-ins
  const daysWithMissedHabits = totalExpectedCompletions - totalActualCompletions;

  return {
    periodLabel,
    periodStart,
    periodEnd,
    totalHabits: habits.length,
    overallCompletionRate,
    longestActiveStreak,
    daysWithMissedHabits: Math.max(0, daysWithMissedHabits),
    totalExpectedCompletions,
    totalActualCompletions,
    habitBreakdown,
  };
};

export const generateConsistencyPDF = (
  reportData: ConsistencyReportData,
  period: 'weekly' | 'monthly'
): void => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let yPos = margin;

  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  doc.setTextColor(11, 11, 11);
  doc.text('Consistency Report', margin, yPos);
  yPos += 12;

  // Period label
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(111, 111, 111);
  doc.text(reportData.periodLabel, margin, yPos);
  yPos += 20;

  // Summary section
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(111, 111, 111);
  doc.text('OVERVIEW', margin, yPos);
  yPos += 10;

  // Stats grid
  const statsData = [
    { label: 'Total Habits', value: reportData.totalHabits.toString() },
    { label: 'Completion Rate', value: `${reportData.overallCompletionRate}%` },
    { label: 'Longest Streak', value: `${reportData.longestActiveStreak} days` },
    { label: 'Missed Check-ins', value: reportData.daysWithMissedHabits.toString() },
  ];

  const colWidth = contentWidth / 4;
  doc.setFontSize(20);
  doc.setTextColor(11, 11, 11);

  statsData.forEach((stat, index) => {
    const xPos = margin + colWidth * index;
    doc.setFont('helvetica', 'bold');
    doc.text(stat.value, xPos, yPos);
  });

  yPos += 6;
  doc.setFontSize(9);
  doc.setTextColor(111, 111, 111);
  doc.setFont('helvetica', 'normal');

  statsData.forEach((stat, index) => {
    const xPos = margin + colWidth * index;
    doc.text(stat.label, xPos, yPos);
  });

  yPos += 20;

  // Divider
  doc.setDrawColor(230, 230, 230);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 15;

  // Per-habit breakdown
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(111, 111, 111);
  doc.text('HABIT BREAKDOWN', margin, yPos);
  yPos += 12;

  reportData.habitBreakdown.forEach((habitData) => {
    if (yPos > 260) {
      doc.addPage();
      yPos = margin;
    }

    // Habit name
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(11, 11, 11);
    doc.text(habitData.habit.name, margin, yPos);
    yPos += 7;

    // Stats line
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(111, 111, 111);
    const statsLine = `${habitData.completionRate}% completion  |  ${habitData.completedCount}/${habitData.expectedCount} check-ins  |  ${habitData.currentStreak}d current streak`;
    doc.text(statsLine, margin, yPos);
    yPos += 6;

    // Progress bar background
    const barHeight = 3;
    doc.setFillColor(230, 230, 230);
    doc.roundedRect(margin, yPos, contentWidth, barHeight, 1.5, 1.5, 'F');

    // Progress bar fill
    if (habitData.completionRate > 0) {
      const fillWidth = (contentWidth * habitData.completionRate) / 100;
      doc.setFillColor(11, 11, 11);
      doc.roundedRect(margin, yPos, fillWidth, barHeight, 1.5, 1.5, 'F');
    }

    yPos += 15;
  });

  // Footer
  yPos = doc.internal.pageSize.getHeight() - 15;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(160, 160, 160);
  doc.text(`Generated on ${new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  })}`, margin, yPos);
  doc.text('Habits', pageWidth - margin - 15, yPos);

  // Save the PDF
  const fileName = `habits-${period}-report-${formatDate(new Date())}.pdf`;
  doc.save(fileName);
};
