"use client";

import { DayPlan, CATEGORY_COLORS, Item } from "@/lib/types";

interface DayTimelineProps {
  plan: DayPlan | null;
  items: Item[];
}

export default function DayTimeline({ plan, items }: DayTimelineProps) {
  const blocks = plan?.time_blocks ?? [];

  if (blocks.length === 0 && !plan?.priorities) {
    return (
      <div className="text-xs text-zinc-600 italic py-2">
        No plan yet — next agent run will create one.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {plan?.priorities && (
        <p className="text-xs text-zinc-400 leading-relaxed">{plan.priorities}</p>
      )}

      {blocks.length > 0 && (
        <div className="space-y-1">
          {blocks.map((block, i) => {
            const linkedItem = block.item_id
              ? items.find((it) => it.id === block.item_id)
              : null;
            const color = linkedItem
              ? CATEGORY_COLORS[linkedItem.category]
              : "#71717a";

            return (
              <div
                key={i}
                className="flex items-start gap-2 py-1.5 group"
              >
                <div
                  className="w-1 h-full min-h-[20px] rounded-full flex-shrink-0 mt-0.5"
                  style={{ backgroundColor: color }}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-[10px] text-zinc-600 font-mono flex-shrink-0">
                      {block.start}
                    </span>
                    <span className="text-xs text-zinc-300 truncate">
                      {block.title}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
