"use client";

import { Item, Category, CATEGORY_COLORS } from "@/lib/types";

interface WorkloadChartProps {
  items: Item[];
}

function toLocalDateStr(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function dayLabel(dateStr: string) {
  const d = new Date(dateStr + "T12:00:00");
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === tomorrow.toDateString()) return "Tmrw";
  return d.toLocaleDateString("en-US", { weekday: "short" });
}

function getNext7Days() {
  const days: string[] = [];
  const d = new Date();
  for (let i = 0; i < 7; i++) {
    days.push(toLocalDateStr(d));
    d.setDate(d.getDate() + 1);
  }
  return days;
}

interface DayStack {
  date: string;
  segments: { category: Category; hours: number }[];
  total: number;
  isOverloaded: boolean;
}

export default function WorkloadChart({ items }: WorkloadChartProps) {
  const days = getNext7Days();
  const activeItems = items.filter((i) => i.status === "active" || i.status === "waiting");

  // Distribute items to their due dates (local tz)
  const dayMap = new Map<string, { category: Category; hours: number }[]>();
  days.forEach((d) => dayMap.set(d, []));

  activeItems.forEach((item) => {
    if (!item.due_at) return;
    const dueDate = toLocalDateStr(new Date(item.due_at));
    const target = dayMap.get(dueDate);
    if (target) {
      target.push({
        category: item.category,
        hours: item.estimated_hours || 1,
      });
    }
  });

  // Items past due or due today that aren't done pile onto today
  const todayStr = days[0];
  activeItems.forEach((item) => {
    if (!item.due_at) return;
    const dueDate = toLocalDateStr(new Date(item.due_at));
    if (dueDate < todayStr) {
      // Overdue — piles onto today
      const target = dayMap.get(todayStr)!;
      target.push({
        category: item.category,
        hours: item.estimated_hours || 1,
      });
    }
  });

  // Aggregate by category per day
  const stacks: DayStack[] = days.map((date) => {
    const entries = dayMap.get(date) || [];
    const byCat = new Map<Category, number>();
    entries.forEach(({ category, hours }) => {
      byCat.set(category, (byCat.get(category) || 0) + hours);
    });
    const segments = Array.from(byCat.entries())
      .map(([category, hours]) => ({ category, hours }))
      .sort((a, b) => b.hours - a.hours);
    const total = segments.reduce((s, seg) => s + seg.hours, 0);

    return {
      date,
      segments,
      total,
      isOverloaded: total > 8, // More than 8 hours = overloaded
    };
  });

  const maxHours = Math.max(...stacks.map((s) => s.total), 8);
  const BAR_MAX_H = 120;

  if (stacks.every((s) => s.total === 0)) {
    return (
      <div className="text-xs text-zinc-600 italic py-2">
        No deadlines with estimated hours in the next 7 days.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-zinc-400">Workload</h3>

      <div className="flex items-end gap-1.5 h-[160px] pt-4">
        {stacks.map((stack) => {
          const barH =
            stack.total > 0 ? (stack.total / maxHours) * BAR_MAX_H : 0;

          return (
            <div
              key={stack.date}
              className="flex-1 flex flex-col items-center gap-1"
            >
              {/* Hours label */}
              {stack.total > 0 && (
                <span
                  className={`text-[10px] font-mono ${
                    stack.isOverloaded
                      ? "text-red-400 font-semibold"
                      : "text-zinc-500"
                  }`}
                >
                  {stack.total % 1 === 0
                    ? stack.total
                    : stack.total.toFixed(1)}
                  h
                </span>
              )}

              {/* Stacked bar */}
              <div
                className="w-full flex flex-col-reverse rounded-t overflow-hidden"
                style={{ height: barH }}
              >
                {stack.segments.map((seg, i) => {
                  const segH = (seg.hours / stack.total) * barH;
                  return (
                    <div
                      key={i}
                      style={{
                        height: segH,
                        backgroundColor: CATEGORY_COLORS[seg.category],
                        opacity: stack.isOverloaded ? 0.9 : 0.6,
                      }}
                      title={`${seg.category}: ${seg.hours}h`}
                    />
                  );
                })}
              </div>

              {/* 8h threshold line position */}

              {/* Day label */}
              <span
                className={`text-[10px] ${
                  stack.date === days[0]
                    ? "text-zinc-300 font-medium"
                    : "text-zinc-600"
                }`}
              >
                {dayLabel(stack.date)}
              </span>
            </div>
          );
        })}
      </div>

      {/* 8h reference line */}
      <div className="flex items-center gap-2">
        <div className="flex-1 border-t border-dashed border-zinc-800" />
        <span className="text-[9px] text-zinc-700">8h/day capacity</span>
        <div className="flex-1 border-t border-dashed border-zinc-800" />
      </div>

      {/* Overload warning */}
      {stacks.some((s) => s.isOverloaded) && (
        <p className="text-[10px] text-red-400/80">
          {stacks.filter((s) => s.isOverloaded).length === 1
            ? `${dayLabel(stacks.find((s) => s.isOverloaded)!.date)} is over capacity.`
            : `${stacks.filter((s) => s.isOverloaded).length} days are over capacity.`}{" "}
          Consider redistributing or dropping low-importance items.
        </p>
      )}
    </div>
  );
}
