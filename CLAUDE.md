# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
cd habits-app && npm run dev      # Start dev server (Vite)
cd habits-app && npm run build    # TypeScript check + production build
cd habits-app && npm run lint     # ESLint
cd habits-app && npm run preview  # Preview production build
```

## Architecture

This is a React 19 habit tracking application built with Vite, TypeScript, and Tailwind CSS v4.

### Tech Stack
- **React 19** with TypeScript
- **Vite 7** for bundling
- **Tailwind CSS 4** (via PostCSS, with `darkMode: 'class'`)
- **Framer Motion** for animations
- **Lucide React** for icons
- **localStorage** for persistence (no backend)

### Project Structure

```
habits-app/src/
├── App.tsx              # Root component with view routing
├── main.tsx             # Entry point
├── index.css            # Global styles + Tailwind
├── types/index.ts       # TypeScript types (Habit, CompletedDay, ViewType)
├── contexts/
│   ├── HabitsContext.tsx  # Habits state management (CRUD + completions)
│   └── ThemeContext.tsx   # Light/dark theme toggle
├── components/          # UI components (Dashboard, Calendar, Stats, Settings, etc.)
└── utils/
    ├── storage.ts       # localStorage wrapper with import/export
    └── dateUtils.ts     # Date formatting helpers
```

### Key Patterns

**State Management**: React Context for global state (`useHabits`, `useTheme` hooks). Habits and completions sync to localStorage on every change.

**Data Model**:
- `Habit`: id, name, color, createdAt, recurrence (daily/weekly/custom), customDays
- `CompletedDay`: habitId + date (YYYY-MM-DD format)
- Dates are stored as ISO strings, compared using YYYY-MM-DD format

**Views**: App uses a simple `ViewType` union (`'home' | 'stats' | 'calendar' | 'settings'`) for navigation, rendered via switch statement in App.tsx.

**Theme**: Dark mode is default. Theme class is applied to `document.documentElement`.
