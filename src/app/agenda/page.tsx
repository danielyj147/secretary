"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { DayPlan, Item, CATEGORY_COLORS } from "@/lib/types";

function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T12:00:00");
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === tomorrow.toDateString()) return "Tomorrow";

  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

function toLocalDateStr(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
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

export default function AgendaPage() {
  const [plans, setPlans] = useState<DayPlan[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const dates = getNext7Days();
      const [plansRes, itemsRes] = await Promise.all([
        supabase
          .from("day_plans")
          .select("*")
          .in("plan_date", dates)
          .order("plan_date"),
        supabase
          .from("items")
          .select("*")
          .in("status", ["active", "waiting"])
          .order("urgency", { ascending: false }),
      ]);
      if (plansRes.data) setPlans(plansRes.data);
      if (itemsRes.data) setItems(itemsRes.data);
    }
    load();
  }, []);

  const dates = getNext7Days();
  const plansByDate = new Map(plans.map((p) => [p.plan_date, p]));

  // Group items by due date in LOCAL timezone (not UTC)
  const itemsByDate = new Map<string, Item[]>();
  items.forEach((item) => {
    if (item.due_at) {
      const d = new Date(item.due_at);
      const date = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      if (!itemsByDate.has(date)) itemsByDate.set(date, []);
      itemsByDate.get(date)!.push(item);
    }
  });

  return (
    <div className="min-h-screen bg-zinc-950">
      <header className="border-b border-zinc-800 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            &larr; Dashboard
          </Link>
          <h1 className="text-base font-semibold text-zinc-100">Agenda</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-8 space-y-8">
        {dates.map((date) => {
          const plan = plansByDate.get(date);
          const dueItems = itemsByDate.get(date) ?? [];
          const blocks = plan?.time_blocks ?? [];
          const hasContent =
            blocks.length > 0 || plan?.priorities || dueItems.length > 0;

          return (
            <div key={date}>
              <h2 className="text-sm font-semibold text-zinc-300 mb-3">
                {formatDate(date)}
              </h2>

              {!hasContent ? (
                <p className="text-xs text-zinc-700 italic pl-4">
                  Nothing scheduled
                </p>
              ) : (
                <div className="space-y-2 pl-4 border-l-2 border-zinc-800">
                  {plan?.priorities && (
                    <p className="text-xs text-zinc-500 leading-relaxed py-1">
                      {plan.priorities}
                    </p>
                  )}

                  {blocks.map((block, i) => {
                    const linkedItem = block.item_id
                      ? items.find((it) => it.id === block.item_id)
                      : null;
                    const color = linkedItem
                      ? CATEGORY_COLORS[linkedItem.category]
                      : "#71717a";

                    return (
                      <div key={i} className="flex items-center gap-3 py-1.5">
                        <span className="text-[10px] text-zinc-600 font-mono w-20 flex-shrink-0">
                          {block.start} - {block.end}
                        </span>
                        <div
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ backgroundColor: color }}
                        />
                        <span className="text-xs text-zinc-300">
                          {block.title}
                        </span>
                      </div>
                    );
                  })}

                  {dueItems.length > 0 && (
                    <div className="pt-2">
                      <p className="text-[10px] text-zinc-600 uppercase tracking-wider mb-1.5">
                        Due
                      </p>
                      {dueItems.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center gap-2 py-1"
                        >
                          <div
                            className="w-2 h-2 rounded-full flex-shrink-0"
                            style={{
                              backgroundColor: CATEGORY_COLORS[item.category],
                            }}
                          />
                          <span className="text-xs text-zinc-400">
                            {item.title}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </main>
    </div>
  );
}
