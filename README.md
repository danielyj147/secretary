# Secretary

A personal AI secretary dashboard that serves as the shared memory between you and a Claude Code scheduled routine. The routine runs twice daily (8am/5pm ET), scans your Gmail and Google Calendar, and manages your tasks through an Eisenhower matrix lens — urgency and importance as continuous dimensions, not rigid quadrants.

**[Live demo with sample data](https://secretary.danielyj.com/demo)** — no sign-in required, click to explore

## Architecture

```
                                  ┌──────────────────┐
                                  │   Cloudflare     │
                                  │   (DNS + Access) │
                                  └────────┬─────────┘
                                           │
┌─────────────────────┐           ┌────────▼─────────┐
│  Claude Code        │           │     Vercel       │
│  Scheduled Routine  │           │   (Next.js 15)   │
│  (8am/5pm ET)       │           │                  │
│                     │           │  Dashboard UI    │
│  - Reads Gmail      │           │  - Eisenhower    │
│  - Reads Calendar   │           │    plane (SVG)   │
│  - Reads user notes │           │  - Agenda view   │
│  - Creates items    │           │  - Agent log     │
│  - Drafts emails    │           │  - Notes input   │
│  - Builds day plans │           │                  │
└──────────┬──────────┘           └────────┬─────────┘
           │                               │
           │    ┌──────────────────┐       │
           └────►   Supabase      ◄───────┘
                │   (Postgres)     │
                │                  │
                │  items           │
                │  secretary_notes │
                │  agent_runs      │
                │  item_changes    │
                │  day_plans       │
                └──────────────────┘
```

**Data flow**: The agent writes to Supabase via `execute_sql` MCP tool. The dashboard reads from Supabase via `@supabase/ssr`. The user annotates items and leaves notes through the dashboard. The agent reads those annotations on the next run.

## Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | Next.js 15 (App Router) + Tailwind CSS v4 | Dashboard UI |
| Database | Supabase (Postgres) | Persistent shared state |
| Auth | Supabase Auth + Cloudflare Access | Dual-layer security |
| Hosting | Vercel | SSR + static hosting |
| DNS/SSL | Cloudflare | Domain + edge protection |
| Agent | Claude Code scheduled routine | Gmail/Calendar scan + task management |
| Visualization | Plain SVG + React | Eisenhower 2D plane |

## Database Schema

### `items`
The core table. Each row is a task, event, email, or deadline positioned on the Eisenhower plane.

| Column | Type | Description |
|--------|------|-------------|
| `urgency` | FLOAT 0-1 | Time sensitivity (recalculated by agent + live on client) |
| `importance` | FLOAT 0-1 | Stakes/impact |
| `category` | TEXT | `academic`, `recruiting`, `personal`, `social`, `financial`, `health` |
| `source_type` | TEXT | `calendar`, `email`, `deadline`, `manual` |
| `source_id` | TEXT | Gmail thread ID or Calendar event ID (for auto-completion detection) |
| `evidence` | TEXT | **Required**. The actual email excerpt, calendar event details, or source material |
| `status` | TEXT | `active`, `waiting`, `completed`, `dismissed`, `expired` |
| `user_remarks` | TEXT | User's notes to the agent about this specific item |
| `user_override` | BOOL | True if user manually repositioned this item (agent respects it) |

### `secretary_notes`
Free-form messages from the user to the agent. The agent acknowledges each note and optionally responds.

### `agent_runs`
Log of each agent execution with summary, change counts, and structured change list.

### `item_changes`
Audit trail: what changed, which item, which run, old/new values, and why.

### `day_plans`
One row per day. Contains `time_blocks` (JSONB array of `{start, end, title, type}`) and a `priorities` narrative.

All tables have RLS enabled with policy: `auth.role() = 'authenticated'`.

## File Structure

```
src/
├── app/
│   ├── page.tsx                    # Main dashboard — Eisenhower plane + sidebar
│   ├── login/page.tsx              # Email/password auth
│   ├── agenda/page.tsx             # 7-day timeline view
│   ├── log/page.tsx                # Agent run history
│   ├── layout.tsx                  # Root layout (Geist fonts, dark theme)
│   └── globals.css                 # Tailwind config, dark theme vars, animations
│
├── components/
│   ├── eisenhower-plane.tsx        # SVG 2D scatter — draggable dots, live urgency,
│   │                               #   quadrant tinting, hover tooltips, resize
│   ├── item-detail-panel.tsx       # Slide-over: evidence, meta, remarks, actions
│   ├── add-item-modal.tsx          # Manual item creation form
│   ├── secretary-notes.tsx         # User→agent notepad with response display
│   ├── day-timeline.tsx            # Today's plan time blocks
│   ├── last-run-card.tsx           # Most recent agent run summary
│   ├── category-filter.tsx         # Toggle chips by category
│   ├── workload-chart.tsx          # 7-day stacked bar chart of est. hours
│   ├── completion-stats.tsx        # Weekly completion mini-chart
│   └── proposals-list.tsx          # Approve/reject agent proposals
│
├── lib/
│   ├── types.ts                    # All TypeScript interfaces + color constants
│   ├── urgency.ts                  # Live urgency: max(stored, 1 - hours/168)
│   └── supabase/
│       ├── client.ts               # Browser Supabase client
│       ├── server.ts               # Server Supabase client (cookie sessions)
│       └── middleware.ts           # Auth redirect middleware
│
└── middleware.ts                    # Next.js middleware entry point

SECRETARY_ROUTINE.md                # The full agent prompt (12-step protocol)
CHANGELOG.md                        # Detailed development changelog
```

## Key Features

### No-Scroll Dashboard
The entire dashboard fits within the viewport — no scrolling required. On desktop, the Eisenhower plane fills the left side while the sidebar scrolls independently on the right. This maximizes situational awareness: everything you need is visible at a glance.

### Mobile-First Design
On iPhone/mobile, the dashboard uses a tabbed interface:
- **Matrix** — the Eisenhower plane with touch-friendly dots
- **Plan** — today's plan, workload chart, agenda/log links
- **Notes** — secretary notes, completion stats, last run

Supports safe-area insets for iPhone notch/home indicator. Can be added to home screen as a web app.

### Eisenhower Plane
- Items rendered as colored dots on a continuous urgency (x) vs importance (y) plane
- **Live urgency**: dots drift rightward in real time as deadlines approach (recalculated every 60 seconds client-side)
- **Draggable**: drag a dot to override the agent's positioning; sets `user_override = true` so the agent respects your judgment
- **Stale indicators**: items stuck for 3+ days with no user action get a pulsing amber ring
- Subtle quadrant tinting with labels: "Do First", "Schedule", "Delegate", "Drop"

### Workload Visualization
7-day stacked bar chart showing estimated hours of work per day, colored by category. Days over 8 hours turn red. Overdue items pile onto today — **procrastination has a visible consequence**: tomorrow's bar grows.

### Focus Mode (`/focus`)
Single-task full-screen view. The AI picks the highest-priority item. Shows: one task, a timer, a deadline countdown, and done/skip buttons. Based on the principle that seeing other tasks degrades performance on the current one (Zeigarnik effect).

### Proposals
The agent creates proposals for significant actions (blocking 2+ hours, drafting important emails, suggesting to drop/reschedule). You approve/reject with one tap. Shifts the paradigm from "here's information, you decide" to "here's a decision, you confirm."

### Evidence
Every agent-created item includes source material: email excerpts, calendar event details, deadline origins. Visible in the detail panel with "Open in Gmail" links for email items.

### Agent Communication
- **Notes to Secretary**: free-form textarea. Write instructions like "Prioritize recruiting this week."
- **Per-item remarks**: annotate any item with context for the agent.
- **Agent log**: see exactly what the agent did on each run and why.

### Auto-Completion
The agent checks `source_id` against live Gmail/Calendar state each run. No manual status updates required.

### Completion Stats
7-day mini bar chart of completed items. Visible progress without gamification.

### Stale Item Detection
The agent identifies stuck items (3+ days, high importance, no remarks) and posts a secretary note asking what's blocking them.

### Projection Warnings
The agent includes forward-looking consequences in day plan priorities: "If you don't start the PHIL paper today, you'll need 4h/day for 2 days instead of 2.5h/day over 3."

## Agent Routine

The scheduled routine runs at 8am and 5pm ET (12-step protocol):

1. Read secretary notes
2. Load active items (respect user overrides/remarks)
3. Scan Gmail + Calendar
4. Auto-complete finished tasks
5. Discover new items (with evidence + estimated hours)
6. Recalculate urgency
7. Act on priorities (drafts, calendar blocks, day plan)
8. Create proposals for significant actions
9. Detect stale items
10. Generate projection warnings
11. Surface opportunities
12. Log everything

Full prompt in [`SECRETARY_ROUTINE.md`](./SECRETARY_ROUTINE.md).

## Security

Two-layer authentication at $0/month:

1. **Cloudflare Access** (edge) — blocks unauthorized users at the CDN before they reach the app
2. **Supabase Auth** (app) — email/password login with session management
3. **Row Level Security** — all 5 tables require `auth.role() = 'authenticated'`
4. **HTTPS** — end-to-end via Cloudflare + Vercel

## Local Development

```bash
npm install
cp .env.local.example .env.local  # Add your Supabase URL and anon key
npm run dev                        # http://localhost:3000
```

## Deployment

Deployed via Vercel CLI:
```bash
npx vercel deploy --prod
```

Domain `[YOUR_DOMAIN]` configured via Cloudflare CNAME → `cname.vercel-dns.com` (DNS only, no proxy).
