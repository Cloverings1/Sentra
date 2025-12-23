// Motivational messages - Alex Hormozi / Tony Robbins style
// Short, punchy, action-oriented

const PROGRESS_MESSAGES = {
  zero: [
    "The day isn't over. Start now.",
    "One rep. That's all it takes to start.",
    "Winners show up. Period.",
    "Your future self is watching.",
    "Discipline beats motivation. Move.",
  ],
  partial: [
    "Momentum is building. Keep going.",
    "You started. That's more than most.",
    "Progress over perfection.",
    "The hard part is done. Finish it.",
    "Good. Now don't stop.",
  ],
  almostDone: [
    "One more. You've got this.",
    "So close. Don't quit now.",
    "Finish what you started.",
    "The last rep is where growth happens.",
    "Champions finish strong.",
  ],
  complete: [
    "All habits done. That's the standard.",
    "100%. This is who you are now.",
    "Dominance. Pure dominance.",
    "Another day conquered.",
    "You showed up. You delivered.",
  ],
};

const CELEBRATION_MESSAGES = [
  "Done.",
  "Locked in.",
  "That's the one.",
  "Rep counted.",
  "Stacking wins.",
  "On the board.",
  "Another one.",
];

/**
 * Get a motivational message based on completion progress
 */
export function getMotivationalMessage(completed: number, total: number): string {
  if (total === 0) return "Create your first habit. Start building.";

  const percentage = (completed / total) * 100;

  let messages: string[];
  if (percentage === 0) {
    messages = PROGRESS_MESSAGES.zero;
  } else if (percentage < 50) {
    messages = PROGRESS_MESSAGES.partial;
  } else if (percentage < 100) {
    messages = PROGRESS_MESSAGES.almostDone;
  } else {
    messages = PROGRESS_MESSAGES.complete;
  }

  // Use date-based seed for consistent message throughout the day
  const today = new Date().toDateString();
  const seed = today.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const index = seed % messages.length;

  return messages[index];
}

/**
 * Get a celebration message for completing a habit
 */
export function getCelebrationMessage(): string {
  const index = Math.floor(Math.random() * CELEBRATION_MESSAGES.length);
  return CELEBRATION_MESSAGES[index];
}

/**
 * Get a streak-focused message
 */
export function getStreakMessage(streak: number): string {
  if (streak === 0) return "Start your streak today.";
  if (streak === 1) return "Day 1. The beginning of something great.";
  if (streak < 7) return `${streak} days. Building momentum.`;
  if (streak < 30) return `${streak} days. This is becoming a habit.`;
  if (streak < 100) return `${streak} days. You're unstoppable.`;
  return `${streak} days. Legendary.`;
}
