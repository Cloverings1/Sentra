# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## About

Sentra is a premium tech support SaaS for Apple products and general technology. The design philosophy is **"quiet, premium, low-stimulus"** - intentional and restrained interfaces that let users focus on getting help. Users submit support tickets, and the admin (Jonas) reviews them, assigns a pricing tier, and resolves issues.

**Admin**: jonas@jonasinfocus.com
**Supabase Project**: qhcuzqkiavbtirynvmyp

## Commands

```bash
cd habits-app && npm run dev      # Start dev server (Vite) - localhost:5173
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
- **Supabase** for auth, database, storage, and realtime

## Architecture

```
habits-app/
├── src/
│   ├── App.tsx                    # Root component with routing
│   ├── main.tsx                   # Entry point
│   ├── index.css                  # Design system + Tailwind
│   ├── contexts/
│   │   ├── AuthContext.tsx        # Auth state, profile updates, avatar upload
│   │   └── ThemeContext.tsx       # Light/dark theme
│   ├── components/
│   │   ├── LandingPage.tsx        # Marketing page with services & pricing
│   │   ├── AuthPage.tsx           # Login/signup
│   │   ├── Dashboard.tsx          # User ticket view
│   │   ├── Settings.tsx           # User preferences
│   │   ├── AdminTicketsView.tsx   # Admin ticket management
│   │   ├── TicketModal.tsx        # Submit new ticket
│   │   ├── PrivacyPage.tsx        # Privacy policy
│   │   ├── TermsPage.tsx          # Terms of service
│   │   └── StatusPage.tsx         # Service status
│   └── utils/
│       ├── supabase.ts            # Supabase client
│       └── avatarUtils.ts         # Avatar validation
└── index.html                     # Entry HTML with OG meta tags
```

## Pricing Model

### One-Time Fixes (A La Carte)
| Tier | Price | Description |
|------|-------|-------------|
| **Quick Fix** | $49 | Simple issues, quick resolution |
| **Standard Fix** | $99 | Moderate complexity |
| **Complex Fix** | $199 | Advanced troubleshooting |

### Monthly Subscriptions (Future)
| Tier | Price | Features |
|------|-------|----------|
| **Tech Peace of Mind** | $199/mo | Priority support, scheduled sessions |
| **Pro Tech Partner** | $399/mo | Unlimited support, dedicated scheduling |

## Ticket Workflow

1. **User submits ticket** → Status: `pending_review`
2. **Admin reviews and assigns tier** → Status: `quote_sent`
3. **User pays** → Status: `paid`
4. **Admin works on issue** → Status: `in_progress`
5. **Admin resolves** → Status: `completed`

### Ticket Statuses
- `pending_review` - Awaiting admin review
- `quote_sent` - Tier assigned, awaiting payment
- `paid` - Payment received, ready for work
- `in_progress` - Admin actively working
- `completed` - Issue resolved
- `cancelled` - Ticket cancelled

## Database Schema (Supabase)

### Tables

```sql
-- User profiles
user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users,
  stripe_customer_id TEXT UNIQUE,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)

-- User entitlements (subscriptions)
user_entitlements (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id),
  plan TEXT DEFAULT 'none',        -- 'none' | 'peace_of_mind' | 'pro_partner'
  status TEXT DEFAULT 'none',      -- 'none' | 'trialing' | 'active' | 'past_due' | 'canceled'
  stripe_subscription_id TEXT,
  current_period_ends_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)

-- Support tickets
tickets (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  user_email TEXT,
  user_name TEXT,
  title TEXT,
  description TEXT,
  status TEXT DEFAULT 'pending_review',
  tier TEXT,                       -- 'quick' | 'standard' | 'complex'
  price INTEGER,                   -- Price in cents
  platform TEXT,
  device_info TEXT,
  admin_notes TEXT,
  resolution_notes TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
```

### RLS Policies

- Users can only view/create their own tickets
- Admin (jonas@jonasinfocus.com) can view/update all tickets
- `is_admin()` function checks if current user is admin

## Key Patterns

### State Management

```typescript
const { user, signOut, updateDisplayName, uploadAvatar } = useAuth();
const { theme, toggleTheme } = useTheme();
```

### Admin Check

```typescript
const ADMIN_EMAIL = 'jonas@jonasinfocus.com';
const isAdmin = user?.email === ADMIN_EMAIL;
```

### Ticket Submission

```typescript
await supabase.from('tickets').insert({
  user_id: user.id,
  user_email: user.email,
  user_name: user.user_metadata?.display_name,
  title,
  description,
  status: 'pending_review',
  platform: navigator.userAgent.includes('Mobile') ? 'mobile' : 'desktop',
  device_info: navigator.userAgent,
});
```

## Environment Variables

```bash
# Supabase
VITE_SUPABASE_URL=https://qhcuzqkiavbtirynvmyp.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...

# Future: Stripe
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
VITE_BILLING_ENABLED=false
```

## Admin Features

Admin email: `jonas@jonasinfocus.com`

- **View all tickets**: See tickets from all users
- **Assign tier**: Set Quick/Standard/Complex tier and price
- **Update status**: Move tickets through workflow
- **Add notes**: Customer-visible and resolution notes
- **Real-time updates**: Supabase realtime subscription

---

# UI/UX Design System Guide

## Design Philosophy

**"Quiet, Premium, Low-Stimulus"**

1. **Restraint over decoration** - No unnecessary visual elements
2. **Typography-first hierarchy** - Size and weight create hierarchy
3. **Minimal color palette** - Dark backgrounds with blue accent
4. **Glass morphism** - Frosted surfaces create depth
5. **Smooth, subtle motion** - 200-400ms transitions
6. **High contrast** - Accessibility through clear contrast

## Color System

### CSS Variables (Dark Mode Default)

```css
--bg-primary: #0B0B0B          /* Main background */
--bg-secondary: #141414        /* Cards, containers */
--bg-tertiary: #181818         /* Elevated surfaces */
--accent: #3b82f6              /* Primary action (blue) */
--text-primary: #F5F5F5        /* Headlines */
--text-secondary: #A0A0A0      /* Body text */
--text-muted: #6F6F6F          /* Metadata */
```

### Status Colors

```typescript
const STATUS_COLORS = {
  pending_review: '#f59e0b',   // Amber
  quote_sent: '#3b82f6',       // Blue
  paid: '#22c55e',             // Green
  in_progress: '#8b5cf6',      // Purple
  completed: '#22c55e',        // Green
  cancelled: '#6b7280',        // Gray
};
```

### Tier Colors

```typescript
const TIER_COLORS = {
  quick: '#22c55e',     // Green - $49
  standard: '#3b82f6',  // Blue - $99
  complex: '#ef4444',   // Red - $199
};
```

## Animation Patterns

```typescript
// Standard easing for all animations
const EASE = [0.32, 0.72, 0, 1];

// Page transitions
initial={{ opacity: 0 }}
animate={{ opacity: 1, transition: { duration: 0.2 } }}
exit={{ opacity: 0, transition: { duration: 0.15 } }}

// List stagger
transition={{ delay: index * 0.05 }}

// Interactive feedback
whileTap={{ scale: 0.95 }}
whileHover={{ scale: 1.02 }}
```

## Component Checklist

When building new components:

- [ ] Uses CSS variables for colors
- [ ] Follows typography class hierarchy
- [ ] Has Framer Motion entrance animation
- [ ] Uses `whileTap` for interactive elements
- [ ] Has proper loading/error states
- [ ] Uses `AnimatePresence` for conditional content
- [ ] Respects 4px spacing increments
