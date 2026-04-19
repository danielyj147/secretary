# Changelog

## 2026-04-19 — v3: No-scroll layout + mobile optimization

### Layout Overhaul
- **No vertical scroll on dashboard** — entire UI fits within `100dvh`, eliminating scroll and maximizing situational awareness
- `src/app/page.tsx` — rewrote layout: `h-dvh` + `overflow-hidden` on the root container. Eisenhower plane and sidebar are side-by-side on desktop, both constrained to viewport. Sidebar scrolls independently.
- `src/app/layout.tsx` — body set to `h-dvh overflow-hidden`, added Apple Web App meta for home screen install
- `src/app/globals.css` — `html, body { height: 100dvh; overflow: hidden }`, added `env(safe-area-inset-*)` padding for iPhone notch/home indicator, disabled tap highlight and callout

### Mobile Optimization
- **Tabbed interface on mobile** — instead of stacking plane + sidebar vertically, mobile shows 3 tabs: Matrix | Plan | Notes. Each fills the screen. No scroll on the matrix tab.
- `src/app/page.tsx` — added `MobileTab` state (`"matrix" | "plan" | "notes"`), tab bar with pending proposal badge, conditional rendering per tab. Agenda/Log/Sign-out links moved inside Plan tab on mobile.
- `src/components/eisenhower-plane.tsx` — responsive padding (28px on small screens, 48px on desktop), removed `min-h-[400px]` constraint, padding now computed from `dimensions.width`
- `src/components/item-detail-panel.tsx` — full-width on mobile (`w-full sm:max-w-md`), reduced padding on small screens
- Header: smaller text/buttons on mobile, Agenda/Log/Sign-out hidden on small screens (accessible via Plan tab)

## 2026-04-19 — v2: Focus mode, workload viz, completion stats, proposals, stale detection

### New Database Additions
- `items.estimated_hours` (FLOAT, default 1.0) — estimated effort per task, drives the workload chart
- `proposals` table — agent-created action proposals (calendar blocks, email drafts, reschedule, drop) that the user approves/rejects from the dashboard

### New Pages
- `src/app/focus/page.tsx` — **Focus mode**. Full-screen single-task view. AI picks the highest urgency x importance item. Shows title, description, category badge, countdown to deadline, urgency progress bar, and a timer (start/pause/resume). Done/Skip buttons. When done, auto-advances to next item.

### New Components
- `src/components/workload-chart.tsx` — **Workload visualization**. 7-day stacked bar chart showing estimated hours per day, colored by category. Days over 8 hours turn red with overload warning. Overdue items pile onto today's bar — procrastination consequence is immediately visible.
- `src/components/completion-stats.tsx` — **Weekly completion stats**. 7-day mini bar chart of completed items, colored by dominant category. Shows total count. Only renders if there are completions.
- `src/components/proposals-list.tsx` — **Pending proposals**. Shows agent-proposed actions with approve/reject buttons. Appears at the top of the sidebar when proposals exist. Badge count on mobile tab.

### Eisenhower Plane Updates
- `src/components/eisenhower-plane.tsx` — **Stale item detection**: items active 3+ days with high importance and no user remarks get a pulsing amber ring (`animate-pulse`) drawing attention to stuck tasks.

### Agent Routine Updates (now 12-step protocol)
- Step 5: now requires `estimated_hours` on every item (0.25 for a quick reply, up to 8.0 for a full paper draft)
- Step 8 (new): **Proposals** — significant actions create DB proposals instead of acting silently
- Step 9 (new): **Stale item detection** — identifies stuck items and posts secretary notes asking what's blocking them
- Step 10 (new): **Projection warnings** — forward-looking consequences in day plan priorities ("If you don't start X today, you'll need Y hours/day")

### Schema Migrations
3. `add_estimated_hours_and_stale` — `estimated_hours` column on `items`, `proposals` table with RLS

## 2026-04-19 — v1: Initial Build

### Infrastructure Setup
- **Supabase project** `eisenhower-matrix` (`[SUPABASE_PROJECT_ID]`) created in `us-east-1`
- **Database schema** — 5 tables with RLS enabled on all:
  - `items` — tasks/events on the Eisenhower plane (urgency/importance as floats 0-1, category, source tracking, status lifecycle, user remarks, override flag)
  - `secretary_notes` — free-form user-to-agent messages with acknowledgment tracking
  - `agent_runs` — agent execution log with summary and change counts
  - `item_changes` — per-item audit trail linked to agent runs
  - `day_plans` — daily time block plans as JSONB with priority narrative
- **RLS policy**: `auth.role() = 'authenticated'` on all tables
- **Triggers**: `updated_at` auto-update on `items` and `day_plans`
- **Supabase Auth** user created via signup API, email confirmed
- **Vercel project** deployed to production
- **Domain**: `[YOUR_DOMAIN]` CNAME → `cname.vercel-dns.com`

### Next.js App (`src/`)

#### Authentication
- `src/lib/supabase/client.ts` — browser-side Supabase client via `@supabase/ssr`
- `src/lib/supabase/server.ts` — server-side Supabase client with cookie-based session handling
- `src/lib/supabase/middleware.ts` — session refresh middleware; redirects unauthenticated users to `/login`
- `src/middleware.ts` — Next.js middleware entry point
- `src/app/login/page.tsx` — email/password login form

#### Shared Library
- `src/lib/types.ts` — TypeScript interfaces for all DB entities + `Proposal`; `CATEGORY_COLORS` and `CATEGORY_BG` constants
- `src/lib/urgency.ts` — client-side live urgency calculator: `max(stored, 1.0 - hours_until_due / 168.0)`. Re-renders every 60s.

#### Pages
- `src/app/page.tsx` — Main dashboard with Eisenhower plane, tabbed mobile layout, sidebar
- `src/app/agenda/page.tsx` — 7-day agenda with local timezone date grouping
- `src/app/log/page.tsx` — Agent run history with expandable change details
- `src/app/focus/page.tsx` — Single-task focus mode with timer

#### Components
- `eisenhower-plane.tsx` — SVG 2D scatter, draggable dots, live urgency, stale indicators, responsive padding
- `item-detail-panel.tsx` — Slide-over with evidence, meta, remarks, actions, mobile-friendly
- `add-item-modal.tsx` — Manual item creation form
- `secretary-notes.tsx` — User→agent notepad with response display
- `day-timeline.tsx` — Today's plan time blocks
- `last-run-card.tsx` — Most recent agent run summary
- `category-filter.tsx` — Toggle chips by category
- `workload-chart.tsx` — 7-day stacked bar chart of estimated hours
- `completion-stats.tsx` — Weekly completion mini-chart
- `proposals-list.tsx` — Approve/reject agent proposals

### Agent Routine (12-step protocol)
1. Read secretary notes → 2. Load items → 3. Scan Gmail/Calendar → 4. Auto-complete → 5. Discover items (with evidence + estimated_hours) → 6. Recalculate urgency → 7. Act on priorities → 8. Create proposals → 9. Detect stale items → 10. Projection warnings → 11. Surface opportunities → 12. Log everything

### Schema Migrations
1. `initial_schema` — 5 tables, indexes, RLS, triggers
2. `add_evidence_column` — `evidence TEXT` on `items`
3. `add_estimated_hours_and_stale` — `estimated_hours FLOAT` on `items`, `proposals` table
