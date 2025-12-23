# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## About

Habits is a SaaS web app helping people master their routines and build daily dependability. The design philosophy is "quiet, premium, low-stimulus" - intentional and restrained interfaces that let users focus on what matters.

## Commands

```bash
cd habits-app && npm run dev      # Start dev server (Vite)
cd habits-app && npm run build    # TypeScript check + production build
cd habits-app && npm run lint     # ESLint
cd habits-app && npm run preview  # Preview production build
```

## Tech Stack

- **React 19** with TypeScript
- **Vite 7** for bundling
- **Tailwind CSS 4** (via PostCSS, `darkMode: 'class'`)
- **Framer Motion** for animations
- **Lucide React** for icons
- **Supabase** for auth (email/password)
- **localStorage** for habit data persistence

## Architecture

```
habits-app/src/
├── App.tsx              # Root component with view routing
├── main.tsx             # Entry point
├── index.css            # Design system + Tailwind
├── types/index.ts       # TypeScript types
├── contexts/
│   ├── HabitsContext.tsx  # Habits state (CRUD, completions, streaks)
│   └── ThemeContext.tsx   # Light/dark theme
├── components/
│   ├── LandingPage.tsx    # Marketing page with pricing
│   ├── AuthPage.tsx       # Login/signup (Supabase)
│   ├── Dashboard.tsx      # Main habit tracking view
│   ├── Calendar.tsx       # Month view
│   ├── Stats.tsx          # Analytics (streaks, completion rates)
│   ├── Settings.tsx       # User preferences
│   ├── Sidebar.tsx        # Navigation
│   ├── HabitCard.tsx      # Stacked card UI for habits
│   ├── WeekView.tsx       # Date strip selector
│   └── AddHabitModal.tsx  # Habit creation modal
└── utils/
    ├── storage.ts         # localStorage wrapper (import/export)
    ├── supabase.ts        # Supabase client
    └── dateUtils.ts       # Date formatting, streak calculation
```

## Key Patterns

**State**: React Context (`useHabits`, `useTheme` hooks). Habits sync to localStorage on every change.

**Data Model**:
- `Habit`: id, name, color, createdAt, recurrence (daily/weekly/custom), customDays
- `CompletedDay`: habitId + date (YYYY-MM-DD)
- Dates stored as ISO strings, compared using YYYY-MM-DD format

**Navigation**: Simple `ViewType` union for in-app views. LandingPage/AuthPage use react-router-dom.

**Theme**: Dark mode default. Class `light` applied to `document.documentElement` for light mode.

## Design System

CSS classes defined in `index.css` following "liquid glass" aesthetic:

- **Layout**: `.app-layout`, `.main-content`, `.sidebar`
- **Typography**: `.text-hero`, `.text-display`, `.text-section-header`, `.text-metadata`
- **Buttons**: `.btn-pill-primary`, `.btn-pill-secondary`, `.btn-ghost`
- **Cards**: `.habit-card`, `.card-pill`, `.card-rounded`
- **Modal**: `.liquid-glass-modal`, `.liquid-glass-backdrop`, `.liquid-glass-input`
- **Stats**: `.stat-number`, `.stat-label`, `.progress-bar`

CSS variables: `--bg-primary`, `--bg-secondary`, `--accent` (#E85D4F), `--text-primary`, `--text-secondary`, `--text-muted`

## Environment Variables

Required for Supabase auth:
```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

## Pricing Tiers

- **Free**: Up to 3 habits, daily/weekly views, local storage
- **Pro** ($9/mo): Unlimited habits, cloud sync, advanced analytics

---

# UI/UX Design System Guide

This section ensures design consistency when building new features.

## Design Philosophy

**"Quiet, Premium, Low-Stimulus"** - Every UI decision follows these principles:

1. **Restraint over decoration** - No unnecessary visual elements
2. **Typography-first hierarchy** - Size and weight, not color, create hierarchy
3. **Minimal color palette** - Dark backgrounds with single accent
4. **Glass morphism** - Frosted surfaces create depth
5. **Smooth, subtle motion** - 200-400ms transitions, no jarring animations
6. **High contrast** - Accessibility through clear text/background contrast

## Color System

### CSS Variables (defined in `index.css`)
```css
/* Dark Mode (Default) */
--bg-primary: #0B0B0B          /* Main background */
--bg-secondary: #141414        /* Cards, containers */
--bg-tertiary: #181818         /* Elevated surfaces */
--accent: #E85D4F              /* Primary action color (coral/rust) */
--text-primary: #F5F5F5        /* Headlines, important text */
--text-secondary: #A0A0A0      /* Body text */
--text-muted: #6F6F6F          /* Metadata, labels */
--surface-glass: rgba(255, 255, 255, 0.06)  /* Glass surfaces */
--border-secondary: rgba(255, 255, 255, 0.12) /* Subtle borders */
```

### Habit Color Palette
```typescript
const HABIT_COLORS = [
  '#ef4444',  // red
  '#f97316',  // orange
  '#eab308',  // yellow
  '#22c55e',  // green
  '#14b8a6',  // teal
  '#3b82f6',  // blue
  '#8b5cf6',  // violet
  '#ec4899',  // pink
  '#6366f1',  // indigo
  '#06b6d4',  // cyan
];
```

### When to Use Colors
- **Accent (#E85D4F)**: Primary buttons, active states, important indicators
- **Habit colors**: Individual habit identification only
- **Text colors**: Follow hierarchy (primary → secondary → muted)
- **NEVER** use bright colors for backgrounds or large areas

## Typography System

### Font Stack
```css
font-family: 'SF Pro Display', 'SF Pro Text', 'Inter', -apple-system,
             BlinkMacSystemFont, 'Helvetica Neue', system-ui, sans-serif;
```

### Typography Classes (Use These)
| Class | Size | Weight | Use For |
|-------|------|--------|---------|
| `.text-hero` | 34px | 600 | Landing page headlines |
| `.text-display` | 32px | 600 | Page titles (Dashboard, Stats) |
| `.text-section-header` | 22px | 500 | Section headers |
| `.text-title` | 18px | 500 | Card titles, modal headers |
| `.text-body-main` | 15px | 400 | Body text, descriptions |
| `.text-metadata` | 12px | 500 | Labels, timestamps (uppercase) |
| `.stat-number` | 64px | 500 | Large statistics |
| `.stat-label` | 13px | 400 | Stat descriptions |

### Typography Rules
- Headlines: -0.02em letter-spacing
- Metadata: 0.08em letter-spacing, uppercase
- Line height: 1.5 for body text
- NEVER use more than 3 type sizes on one screen

## Component Patterns

### Button Styles
```jsx
// Primary action (white background)
<button className="btn-pill-primary">Save habit</button>

// Secondary action (transparent with border)
<button className="btn-pill-secondary">Cancel</button>

// Ghost/tertiary (minimal, text only)
<button className="btn-ghost">Learn more</button>

// Glass modal primary
<button className="liquid-glass-btn-primary">Continue</button>

// Glass modal secondary
<button className="liquid-glass-btn-secondary">Cancel</button>
```

### Card Patterns
```jsx
// Habit card (stacked effect)
<div className="habit-card" style={{ marginTop: index === 0 ? 0 : -20 }}>

// Glass container
<div className="card-pill">

// Solid rounded container
<div className="card-rounded">
```

### Input Patterns
```jsx
// Standard text input
<input className="liquid-glass-input" placeholder="..." />

// Segmented control container
<div className="liquid-glass-segment">
  <button className="liquid-glass-segment-btn active">Daily</button>
  <button className="liquid-glass-segment-btn">Weekly</button>
</div>

// Color picker button
<button className="liquid-glass-color-btn" style={{ backgroundColor: color }} />

// Day selector button (Mon, Tue, etc.)
<button className="liquid-glass-day-btn">M</button>
```

## Modal Patterns

### Standard Modal Structure
```jsx
<AnimatePresence>
  {isOpen && (
    <>
      {/* Backdrop - always clickable to close */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
        onClick={onClose}
        className="fixed inset-0 z-50 liquid-glass-backdrop"
      />

      {/* Modal container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                   z-50 w-full max-w-[400px] px-7 py-8 liquid-glass-modal"
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-title">Modal Title</h2>
          <button onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        {children}
      </motion.div>
    </>
  )}
</AnimatePresence>
```

### Modal Props Convention
```typescript
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}
```

### Modal Width Guidelines
- Standard forms: `max-w-[400px]`
- Paywall/pricing: `max-w-[420px]`
- Reports/content-heavy: `max-w-[520px]`
- Scrollable content: add `max-h-[85vh] overflow-y-auto`

## Animation Patterns

### Standard Easing
```typescript
const EASE = [0.32, 0.72, 0, 1]; // Use this for all custom animations
```

### Page Transitions
```typescript
const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};
```

### Staggered List Items
```jsx
<motion.div
  initial={{ opacity: 0, y: 10 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: index * 0.05 }}  // 50ms stagger
>
```

### Interactive Feedback
```jsx
// Buttons and clickable items
whileTap={{ scale: 0.95 }}  // or 0.98 for larger elements

// Hover states (desktop)
whileHover={{ scale: 1.02 }}
```

### Conditional Content
```jsx
<AnimatePresence>
  {showContent && (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3, ease: EASE }}
    />
  )}
</AnimatePresence>
```

### Animation Rules
- Duration: 0.2-0.4s (never longer)
- Always use `AnimatePresence` for exit animations
- Stagger delay: 0.05s between items
- Never animate colors or complex transforms simultaneously

## Form Patterns

### Form Structure
```jsx
<form onSubmit={handleSubmit} className="space-y-6">
  {/* Each field with consistent spacing */}
  <div>
    <label className="text-metadata block mb-2">FIELD LABEL</label>
    <input className="liquid-glass-input w-full" />
  </div>

  {/* Actions at bottom */}
  <button
    type="submit"
    className="liquid-glass-btn-primary w-full"
    disabled={!isValid || isLoading}
  >
    {isLoading ? 'Loading...' : 'Submit'}
  </button>
</form>
```

### Validation States
```jsx
// Disable submit when invalid
disabled={!habitName.trim()}

// Show loading state
{isLoading ? 'Saving...' : 'Save'}

// Error display
{error && (
  <motion.p
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="text-sm"
    style={{ color: 'var(--accent)' }}
  >
    {error}
  </motion.p>
)}
```

### Limit Warnings (Free Tier)
```jsx
{isAtLimit && (
  <motion.div
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    className="p-4 rounded-xl mb-4"
    style={{ background: 'rgba(232, 93, 79, 0.1)' }}
  >
    <p className="text-sm">You've reached the 3 habit limit.</p>
    <button onClick={() => setShowPaywall(true)}>
      Upgrade to Pro
    </button>
  </motion.div>
)}
```

## Loading & Error States

### Loading States
```jsx
// Full page loading - return null to prevent flash
if (loading) return null;

// Button loading
<button disabled={isLoading}>
  {isLoading ? 'Loading...' : 'Continue'}
</button>

// Async operation loading
const [isExporting, setIsExporting] = useState(false);
const handleExport = async () => {
  setIsExporting(true);
  try {
    await exportData();
  } finally {
    setIsExporting(false);
  }
};
```

### Error Display
```jsx
{error && (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="text-sm mb-4"
    style={{ color: 'var(--accent)' }}
  >
    {error}
  </motion.div>
)}
```

### Empty States
```jsx
{items.length === 0 ? (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="flex flex-col items-center justify-center py-8 text-center"
  >
    <h3 className="text-title mb-2">No items yet</h3>
    <p className="text-body mb-6 max-w-[260px]" style={{ color: 'var(--text-secondary)' }}>
      Helpful description of what to do.
    </p>
    <button className="btn-pill-primary">Create first item</button>
  </motion.div>
) : (
  <ItemsList items={items} />
)}
```

## Responsive Design

### Breakpoints
- Mobile: Default (no prefix)
- Tablet: `sm:` (640px)
- Desktop: `md:` (768px)
- Large: `lg:` (1024px)

### Common Patterns
```jsx
// Stack on mobile, row on desktop
<div className="flex flex-col md:flex-row gap-4">

// Grid columns
<div className="grid grid-cols-1 md:grid-cols-3 gap-6">

// Max width container
<div className="max-w-[1200px] mx-auto px-6">

// Text alignment
<section className="text-center sm:text-left">
```

### Layout Constraints
- Main content: `max-width: 1200px`
- Modals: `max-width: 400-520px`
- Bottom padding: `100px` (for fixed nav)

## Navigation Patterns

### Bottom Navigation
- Fixed position at bottom
- 4 tabs maximum
- Active indicator: horizontal bar for stats, dot for others
- Icons: 20-24px, consistent stroke width
- Glass morphism: `bg-black/80 backdrop-blur-xl`

### View Routing
```typescript
type ViewType = 'home' | 'stats' | 'calendar' | 'settings';

// In App.tsx
const [currentView, setCurrentView] = useState<ViewType>('home');

<Navigation
  currentView={currentView}
  onNavigate={setCurrentView}
/>
```

## Component Checklist

When building new components, ensure:

- [ ] Uses CSS variables for colors (not hardcoded)
- [ ] Follows typography class hierarchy
- [ ] Has Framer Motion entrance animation
- [ ] Uses `whileTap` for interactive elements
- [ ] Follows modal pattern if overlay
- [ ] Has proper loading state
- [ ] Has error handling
- [ ] Uses `AnimatePresence` for conditional content
- [ ] Respects spacing conventions (4px increments)
- [ ] Matches existing component patterns

## File Organization

```
src/components/
├── Page Components (single-use views)
│   ├── Dashboard.tsx
│   ├── Calendar.tsx
│   ├── Stats.tsx
│   └── Settings.tsx
├── Modal Components (overlay patterns)
│   ├── AddHabitModal.tsx
│   ├── PaywallModal.tsx
│   └── ConsistencyReport.tsx
├── Navigation Components
│   ├── Navigation.tsx (bottom nav)
│   └── Sidebar.tsx (desktop nav)
└── Reusable Components
    ├── HabitCard.tsx
    ├── WeekView.tsx
    ├── MonthGrid.tsx
    └── StreakCounter.tsx
```

## Quick Reference

| Element | Class/Pattern |
|---------|---------------|
| Page title | `.text-display` |
| Section header | `.text-section-header` |
| Primary button | `.btn-pill-primary` or `.liquid-glass-btn-primary` |
| Secondary button | `.btn-pill-secondary` or `.liquid-glass-btn-secondary` |
| Text input | `.liquid-glass-input` |
| Modal wrapper | `.liquid-glass-modal` + `.liquid-glass-backdrop` |
| Habit card | `.habit-card` with stacked margins |
| Accent color | `var(--accent)` or `#E85D4F` |
| Body text color | `var(--text-secondary)` |
| Muted text color | `var(--text-muted)` |
| Animation ease | `[0.32, 0.72, 0, 1]` |
| Stagger delay | `index * 0.05` |
| Tap feedback | `whileTap={{ scale: 0.95 }}` |
