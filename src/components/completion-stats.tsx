"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { CATEGORY_COLORS, Category } from "@/lib/types";

interface DayCount {
  date: string;
  count: number;
  categories: Partial<Record<Category, number>>;
}

export default function CompletionStats() {
  const [days, setDays] = useState<DayCount[]>([]);
  const [totalWeek, setTotalWeek] = useState(0);
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data } = await supabase
        .from("items")
        .select("completed_at, category")
        .eq("status", "completed")
        .gte("completed_at", sevenDaysAgo.toISOString());

      if (!data) return;

      // Group by local date
      const byDate = new Map<string, { count: number; categories: Partial<Record<Category, number>> }>();
      const now = new Date();
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
        byDate.set(key, { count: 0, categories: {} });
      }

      data.forEach((item) => {
        if (!item.completed_at) return;
        const d = new Date(item.completed_at);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
        const entry = byDate.get(key);
        if (entry) {
          entry.count++;
          const cat = item.category as Category;
          entry.categories[cat] = (entry.categories[cat] || 0) + 1;
        }
      });

      const result: DayCount[] = [];
      byDate.forEach((val, date) => {
        result.push({ date, ...val });
      });
      setDays(result);
      setTotalWeek(data.length);
    }
    load();
  }, []);

  if (totalWeek === 0 && days.every((d) => d.count === 0)) {
    return null; // Don't show if nothing completed
  }

  const maxCount = Math.max(...days.map((d) => d.count), 1);

  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between">
        <h3 className="text-sm font-medium text-zinc-400">This Week</h3>
        <span className="text-xs text-zinc-600">
          {totalWeek} completed
        </span>
      </div>

      <div className="flex items-end gap-1 h-8">
        {days.map((day) => {
          const h = day.count > 0 ? Math.max(4, (day.count / maxCount) * 28) : 2;
          const isToday =
            day.date ===
            `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}-${String(new Date().getDate()).padStart(2, "0")}`;

          // Get dominant category color
          let color = "#3f3f46"; // zinc-700 default
          if (day.count > 0) {
            const entries = Object.entries(day.categories) as [Category, number][];
            entries.sort((a, b) => b[1] - a[1]);
            color = CATEGORY_COLORS[entries[0][0]];
          }

          return (
            <div
              key={day.date}
              className="flex-1 flex flex-col items-center gap-0.5"
            >
              <div
                className="w-full rounded-sm transition-all"
                style={{
                  height: h,
                  backgroundColor: color,
                  opacity: day.count > 0 ? 0.6 : 0.15,
                }}
                title={`${day.date}: ${day.count} completed`}
              />
              {isToday && (
                <div className="w-1 h-1 rounded-full bg-zinc-500" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
