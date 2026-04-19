import { Item, SecretaryNote, AgentRun, DayPlan, Proposal } from "./types";

const now = new Date();
const tomorrow = new Date(now);
tomorrow.setDate(tomorrow.getDate() + 1);
const dayAfter = new Date(now);
dayAfter.setDate(dayAfter.getDate() + 2);
const in4Days = new Date(now);
in4Days.setDate(in4Days.getDate() + 4);
const in5Days = new Date(now);
in5Days.setDate(in5Days.getDate() + 5);

function hoursFromNow(h: number) {
  return new Date(now.getTime() + h * 3600000).toISOString();
}

function daysFromNow(d: number, hour = 23, min = 59) {
  const dt = new Date(now);
  dt.setDate(dt.getDate() + d);
  dt.setHours(hour, min, 0, 0);
  return dt.toISOString();
}

function todayStr() {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

export const DEMO_ITEMS: Item[] = [
  {
    id: "d1",
    title: "Econ 301 Final Review",
    description: "Comprehensive review of macro models, trade theory, IS-LM",
    urgency: 0.88,
    importance: 0.95,
    category: "academic",
    source_type: "calendar",
    source_id: null,
    source_snapshot: null,
    status: "active",
    status_reason: null,
    due_at: hoursFromNow(8),
    created_at: hoursFromNow(-48),
    updated_at: hoursFromNow(-1),
    completed_at: null,
    user_remarks: null,
    user_override: false,
    evidence:
      'Google Calendar event "DUE: Econ 301 Final Exam" tomorrow at 2:00 PM. Description: "Cumulative final covering macro models (IS-LM, AD-AS), trade theory (Heckscher-Ohlin, Stolper-Samuelson), and monetary policy. Weighted 40% of final grade."',
    estimated_hours: 5.0,
  },
  {
    id: "d2",
    title: "Reply to Goldman Sachs recruiter",
    description:
      "Follow up on summer analyst interest — they asked for availability next week",
    urgency: 0.75,
    importance: 0.88,
    category: "recruiting",
    source_type: "email",
    source_id: "thread-abc123",
    source_snapshot: null,
    status: "active",
    status_reason: null,
    due_at: hoursFromNow(24),
    created_at: hoursFromNow(-36),
    updated_at: hoursFromNow(-2),
    completed_at: null,
    user_remarks: "Want to mention my econ thesis in the reply",
    user_override: false,
    evidence:
      'From: Sarah Chen <s.chen@gs.com>\nDate: Yesterday, 3:42 PM\nSubject: Re: Summer Analyst — Follow Up\n\n"Hi — thanks for the great conversation at the info session last week. We\'d love to schedule a 30-min call to discuss the SA role. Could you share your availability for next Tue-Thu? Please also send your updated resume if you have one."',
    estimated_hours: 0.5,
  },
  {
    id: "d3",
    title: "Phil 312 paper — 7-page draft",
    description:
      "Geopolitics of semiconductor supply chains — 8 page paper",
    urgency: 0.45,
    importance: 0.82,
    category: "academic",
    source_type: "deadline",
    source_id: null,
    source_snapshot: null,
    status: "active",
    status_reason: null,
    due_at: daysFromNow(4),
    created_at: hoursFromNow(-120),
    updated_at: hoursFromNow(-6),
    completed_at: null,
    user_remarks: null,
    user_override: false,
    evidence:
      'Syllabus (Phil 312, Prof. Hartley): "Final paper due Friday 11:59 PM. 7-8 pages, double-spaced, Chicago style. Topic must address an ethical dimension of contemporary geopolitics. Outline was approved on 4/10."',
    estimated_hours: 6.0,
  },
  {
    id: "d4",
    title: "Jazz ensemble rehearsal",
    description: "Final rehearsal before spring concert",
    urgency: 0.35,
    importance: 0.5,
    category: "social",
    source_type: "calendar",
    source_id: null,
    source_snapshot: null,
    status: "active",
    status_reason: null,
    due_at: daysFromNow(1, 19, 0),
    created_at: hoursFromNow(-72),
    updated_at: hoursFromNow(-72),
    completed_at: null,
    user_remarks: null,
    user_override: false,
    evidence:
      'Google Calendar event "Jazz Ensemble — Final Rehearsal" tomorrow 7:00–9:00 PM at Dana Arts Center, Room 102. Attendees: 12 ensemble members. Description: "Full run-through of spring concert setlist. Bring charts for Coltrane arrangement."',
    estimated_hours: 2.0,
  },
  {
    id: "d5",
    title: "Schedule dentist appointment",
    description: "Overdue — local dental center",
    urgency: 0.15,
    importance: 0.3,
    category: "health",
    source_type: "manual",
    source_id: null,
    source_snapshot: null,
    status: "active",
    status_reason: null,
    due_at: null,
    created_at: hoursFromNow(-168),
    updated_at: hoursFromNow(-168),
    completed_at: null,
    user_remarks: null,
    user_override: false,
    evidence: null,
    estimated_hours: 0.25,
  },
  {
    id: "d6",
    title: "COSC 202 Quiz 11-12",
    description: "Data structures quiz — heaps and graphs",
    urgency: 0.25,
    importance: 0.6,
    category: "academic",
    source_type: "calendar",
    source_id: null,
    source_snapshot: null,
    status: "active",
    status_reason: null,
    due_at: daysFromNow(5, 23, 59),
    created_at: hoursFromNow(-48),
    updated_at: hoursFromNow(-2),
    completed_at: null,
    user_remarks: null,
    user_override: false,
    evidence:
      'Google Calendar event "DUE: COSC202 Quiz 11-12" in 5 days at 11:59 PM. Description: "COSC 202 Quiz covering chapters 11-12: heaps, priority queues, graph representations, BFS/DFS. Open on Moodle, 45 minutes timed."',
    estimated_hours: 1.0,
  },
  {
    id: "d7",
    title: "NYC apartment research",
    description:
      "Start looking at post-graduation housing options",
    urgency: 0.1,
    importance: 0.55,
    category: "personal",
    source_type: "manual",
    source_id: null,
    source_snapshot: null,
    status: "active",
    status_reason: null,
    due_at: null,
    created_at: hoursFromNow(-96),
    updated_at: hoursFromNow(-96),
    completed_at: null,
    user_remarks: null,
    user_override: false,
    evidence: null,
    estimated_hours: 1.5,
  },
];

export const DEMO_NOTES: SecretaryNote[] = [
  {
    id: "n1",
    content: "Prioritize recruiting emails this week — I need to lock down summer plans.",
    created_at: hoursFromNow(-6),
    acknowledged_at: hoursFromNow(-1),
    agent_response:
      "Got it. Recruiting items boosted to importance > 0.85. Drafted a reply to the GS recruiter — check Gmail drafts.",
  },
  {
    id: "n2",
    content: "I already talked to Prof. Hartley about the paper extension — deadline moved to Saturday.",
    created_at: hoursFromNow(-2),
    acknowledged_at: null,
    agent_response: null,
  },
];

export const DEMO_LAST_RUN: AgentRun = {
  id: "r1",
  started_at: hoursFromNow(-1),
  completed_at: hoursFromNow(-0.9),
  run_type: "scheduled",
  summary:
    "Created 2 new items from Gmail. Econ final urgency bumped to 88% (8h out). Drafted reply to GS recruiter. Built today's study plan around the final.",
  changes: null,
  items_created: 2,
  items_updated: 3,
  items_completed: 1,
  errors: null,
};

export const DEMO_TODAY_PLAN: DayPlan = {
  id: "p1",
  plan_date: todayStr(),
  time_blocks: [
    { start: "9:00", end: "11:30", title: "Econ 301 — macro models deep review", type: "study" },
    { start: "11:30", end: "12:00", title: "Draft reply to GS recruiter", type: "email" },
    { start: "13:00", end: "15:30", title: "Econ 301 — trade theory + practice problems", type: "study" },
    { start: "15:30", end: "16:00", title: "Break", type: "break" },
    { start: "18:00", end: "20:00", title: "Econ 301 — IS-LM final pass + mock exam", type: "study" },
  ],
  priorities:
    "Econ final is in 8 hours — that's the entire day. GS recruiter reply is quick but time-sensitive; slot it between study blocks. If you don't start the Phil paper outline tonight, you'll need 3h/day for 3 days instead of 2h/day for 4.",
  created_at: hoursFromNow(-1),
  updated_at: hoursFromNow(-1),
};

export const DEMO_PROPOSALS: Proposal[] = [
  {
    id: "pr1",
    run_id: "r1",
    item_id: "d4",
    action_type: "reschedule",
    title: "Skip jazz rehearsal tonight",
    description:
      "Your Econ final is tomorrow at 2 PM and you have 5 hours of review left. Rehearsal is 7-9 PM — that's your last study window. Want me to email the director that you'll miss it?",
    status: "pending",
    created_at: hoursFromNow(-1),
    resolved_at: null,
  },
];
