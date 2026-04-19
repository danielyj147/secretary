export type Category =
  | "academic"
  | "recruiting"
  | "personal"
  | "social"
  | "financial"
  | "health";

export type SourceType = "calendar" | "email" | "deadline" | "manual";

export type ItemStatus =
  | "active"
  | "waiting"
  | "completed"
  | "dismissed"
  | "expired";

export interface Item {
  id: string;
  title: string;
  description: string | null;
  urgency: number;
  importance: number;
  category: Category;
  source_type: SourceType;
  source_id: string | null;
  source_snapshot: Record<string, unknown> | null;
  status: ItemStatus;
  status_reason: string | null;
  due_at: string | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  user_remarks: string | null;
  user_override: boolean;
  evidence: string | null;
  estimated_hours: number;
}

export interface Proposal {
  id: string;
  run_id: string | null;
  item_id: string | null;
  action_type: "calendar_block" | "email_draft" | "reschedule" | "drop" | "other";
  title: string;
  description: string | null;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  resolved_at: string | null;
}

export interface SecretaryNote {
  id: string;
  content: string;
  created_at: string;
  acknowledged_at: string | null;
  agent_response: string | null;
}

export interface AgentRun {
  id: string;
  started_at: string;
  completed_at: string | null;
  run_type: string;
  summary: string | null;
  changes: Record<string, unknown> | null;
  items_created: number;
  items_updated: number;
  items_completed: number;
  errors: Record<string, unknown> | null;
}

export interface ItemChange {
  id: string;
  run_id: string;
  item_id: string;
  change_type: string;
  field_changed: string | null;
  old_value: string | null;
  new_value: string | null;
  reason: string | null;
  created_at: string;
}

export interface DayPlan {
  id: string;
  plan_date: string;
  time_blocks: TimeBlock[] | null;
  priorities: string | null;
  created_at: string;
  updated_at: string;
}

export interface TimeBlock {
  start: string;
  end: string;
  title: string;
  item_id?: string;
  type: string;
}

export const CATEGORY_COLORS: Record<Category, string> = {
  academic: "#3B82F6",
  recruiting: "#10B981",
  personal: "#F59E0B",
  social: "#8B5CF6",
  financial: "#EF4444",
  health: "#EC4899",
};

export const CATEGORY_BG: Record<Category, string> = {
  academic: "bg-blue-500/20 text-blue-400",
  recruiting: "bg-emerald-500/20 text-emerald-400",
  personal: "bg-amber-500/20 text-amber-400",
  social: "bg-violet-500/20 text-violet-400",
  financial: "bg-red-500/20 text-red-400",
  health: "bg-pink-500/20 text-pink-400",
};
