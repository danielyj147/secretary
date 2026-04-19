import { Item } from "./types";

/**
 * Calculates live urgency based on current time and due date.
 * Uses the same formula as the agent: max(stored_urgency, 1.0 - hours_until_due / 168.0)
 * Skips user-overridden items (they keep their manually set value).
 */
export function liveUrgency(item: Item): number {
  if (item.user_override || !item.due_at) {
    return item.urgency;
  }

  const hoursUntilDue =
    (new Date(item.due_at).getTime() - Date.now()) / (1000 * 60 * 60);

  if (hoursUntilDue <= 0) return 1.0;

  const computed = 1.0 - hoursUntilDue / 168.0;
  return Math.max(item.urgency, Math.min(1.0, computed));
}
