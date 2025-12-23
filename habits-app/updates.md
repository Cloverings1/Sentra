# Habits App - Internal Updates

A running log of what's been shipped. Written by Jonas.

---

## December 22, 2025

### Security Lockdown (Critical)

Finally did a proper security audit before inviting friends to beta. Found some scary stuff - **RLS was disabled on the main tables**. This meant any logged-in user could technically see everyone else's habits. Fixed immediately.

**What was fixed:**
- Enabled Row Level Security on `habits` table
- Enabled Row Level Security on `completions` table
- Enabled Row Level Security on `profiles` table
- Fixed 3 database functions that had security warnings
- Each user's data is now completely isolated at the database level

**Added trust signals:**
- Landing page hero: "Private & encrypted" with lock icon
- Landing page footer: "Your data is isolated and protected with row-level security"
- Login page: Added header with back-to-home navigation + "Secure login" indicator
- Login page: Added footer with security message + Privacy/Terms links

---

### Fixed "Create Habit" Bug

The create habit button wasn't working. Clicked it, filled everything in, hit create... nothing happened. Super frustrating.

**Root cause:**
1. Code was sending a `customDays` field to Supabase but that column didn't exist in the database
2. The error was being silently swallowed because the submit handler wasn't using async/await properly
3. Modal was closing before the API call finished, so it looked like nothing happened

**What was fixed:**
- Added `custom_days` column to the habits table in Supabase
- Fixed all the snake_case/camelCase mismatches between frontend and database
- Made the form submission properly async with try/catch
- Added loading state ("Creating...") so users know something's happening
- Added error display if something goes wrong
- Button now stays disabled while submitting

---

### Home Page Revamp

Made the dashboard feel like an actual product instead of a prototype.

**New features:**
- **Global streak indicator** - Shows your overall streak with a fire emoji (or sleeping emoji when you're at 0)
- **Progress indicator** - "Today: 2/3" so you know how many habits you've done
- **Motivational messages** - Short, punchy quotes that change based on your progress. Alex Hormozi / Tony Robbins style. Things like "Your future self is watching" and "Momentum is building. Keep going."
- **Completion dots on week view** - Each day shows colored dots for which habits you completed
- **Completion dots on calendar** - Same thing but for the full calendar view. Dots overlap if you have more than 3 habits.
- **Celebration animation** - Quick toast + confetti particles when you complete a habit
- **"My Habits" section header** - Shows the count of habits you have
- **Better empty state** - Pulsing cyan button with motivating copy to get people started
- **Add habit button pulse** - Calm, slow cyan pulse animation when you have no habits yet

**Code quality:**
- Created reusable `CompletionDots` component
- Created `GlobalStreak` component
- Added `getCompletedHabitsForDate` to context to avoid duplicate logic
- Fixed timezone bug in streak calculation (was using raw milliseconds, now uses proper date arithmetic)
- Extracted shared streak calculation logic to keep things DRY

---

### Files Changed

**New files:**
- `src/components/CompletionDots.tsx`
- `src/components/GlobalStreak.tsx`
- `src/utils/motivationalMessages.ts`

**Modified:**
- `src/components/Dashboard.tsx` - Major updates for new features
- `src/components/WeekView.tsx` - Added completion dots
- `src/components/Calendar.tsx` - Added completion dots
- `src/components/HabitCard.tsx` - Added celebration animation
- `src/components/AddHabitModal.tsx` - Fixed async/error handling
- `src/components/LandingPage.tsx` - Added security indicators
- `src/components/AuthPage.tsx` - Added header/footer navigation
- `src/contexts/HabitsContext.tsx` - Added helper function, fixed DB column names
- `src/utils/dateUtils.ts` - Fixed timezone bug, added DRY helpers

**Database migrations applied:**
- `add_custom_days_column` - Added missing column for custom recurrence
- `secure_habits_table_rls` - RLS + policies for habits
- `secure_completions_table_rls` - RLS + policies for completions
- `secure_profiles_table_rls` - RLS + policies for profiles
- `fix_function_search_paths` - Security hardening for DB functions

---

## Status

Ready for private beta with 10 friends. Security is solid, core features work, UI feels polished.

**Next up (probably):**
- Actually invite people
- See what breaks
- Iterate based on feedback
