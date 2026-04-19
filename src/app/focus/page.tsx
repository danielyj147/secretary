"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Item, CATEGORY_COLORS, CATEGORY_BG } from "@/lib/types";
import { liveUrgency } from "@/lib/urgency";

export default function FocusPage() {
  const [item, setItem] = useState<Item | null>(null);
  const [allItems, setAllItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("items")
        .select("*")
        .in("status", ["active", "waiting"])
        .order("created_at", { ascending: false });

      if (data && data.length > 0) {
        setAllItems(data);
        // Pick the highest urgency*importance item
        const sorted = [...data].sort(
          (a, b) =>
            liveUrgency(b) * b.importance - liveUrgency(a) * a.importance
        );
        setItem(sorted[0]);
      }
      setLoading(false);
    }
    load();
  }, []);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  function toggleTimer() {
    if (running) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setRunning(false);
    } else {
      intervalRef.current = setInterval(() => {
        setElapsed((e) => e + 1);
      }, 1000);
      setRunning(true);
    }
  }

  async function markDone() {
    if (!item) return;
    await supabase
      .from("items")
      .update({ status: "completed", completed_at: new Date().toISOString() })
      .eq("id", item.id);

    // Move to next item
    const remaining = allItems.filter((i) => i.id !== item.id);
    setAllItems(remaining);
    if (remaining.length > 0) {
      const sorted = [...remaining].sort(
        (a, b) =>
          liveUrgency(b) * b.importance - liveUrgency(a) * a.importance
      );
      setItem(sorted[0]);
    } else {
      setItem(null);
    }
    setElapsed(0);
    setRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  }

  function skipToNext() {
    const currentIdx = allItems.findIndex((i) => i.id === item?.id);
    const sorted = [...allItems].sort(
      (a, b) =>
        liveUrgency(b) * b.importance - liveUrgency(a) * a.importance
    );
    const nextIdx = sorted.findIndex((i) => i.id === item?.id);
    const next = sorted[nextIdx + 1] || sorted[0];
    if (next && next.id !== item?.id) {
      setItem(next);
      setElapsed(0);
      setRunning(false);
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
  }

  function formatTime(seconds: number) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    return `${m}:${String(s).padStart(2, "0")}`;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <span className="text-sm text-zinc-600">Loading...</span>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center gap-4">
        <p className="text-lg text-zinc-400">Nothing to do right now.</p>
        <Link
          href="/"
          className="text-xs text-zinc-600 hover:text-zinc-300 transition-colors"
        >
          Back to dashboard
        </Link>
      </div>
    );
  }

  const color = CATEGORY_COLORS[item.category];
  const dueStr = item.due_at
    ? new Date(item.due_at).toLocaleString("en-US", {
        weekday: "short",
        hour: "numeric",
        minute: "2-digit",
      })
    : null;

  const hoursUntilDue = item.due_at
    ? (new Date(item.due_at).getTime() - Date.now()) / (1000 * 60 * 60)
    : null;

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      {/* Minimal header */}
      <header className="px-6 py-3 flex items-center justify-between">
        <Link
          href="/"
          className="text-xs text-zinc-600 hover:text-zinc-300 transition-colors"
        >
          &larr; Dashboard
        </Link>
        <span className="text-[10px] text-zinc-700 uppercase tracking-wider">
          Focus
        </span>
      </header>

      {/* Center: the one thing */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 max-w-lg mx-auto w-full">
        <div className="w-full space-y-8 text-center">
          {/* Category */}
          <span
            className={`inline-block px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider ${CATEGORY_BG[item.category]}`}
          >
            {item.category}
          </span>

          {/* Title */}
          <h1 className="text-2xl font-semibold text-zinc-100 leading-tight">
            {item.title}
          </h1>

          {/* Description */}
          {item.description && (
            <p className="text-sm text-zinc-500 leading-relaxed max-w-md mx-auto">
              {item.description}
            </p>
          )}

          {/* Due + urgency bar */}
          {dueStr && (
            <div className="space-y-2">
              <p className="text-xs text-zinc-600">
                Due {dueStr}
                {hoursUntilDue !== null && hoursUntilDue < 24 && (
                  <span
                    className={`ml-2 ${
                      hoursUntilDue < 2
                        ? "text-red-400"
                        : hoursUntilDue < 6
                        ? "text-amber-400"
                        : "text-zinc-500"
                    }`}
                  >
                    ({hoursUntilDue < 1
                      ? `${Math.round(hoursUntilDue * 60)}min left`
                      : `${hoursUntilDue.toFixed(1)}h left`})
                  </span>
                )}
              </p>
              <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-1000"
                  style={{
                    width: `${Math.min(100, liveUrgency(item) * 100)}%`,
                    backgroundColor: color,
                  }}
                />
              </div>
            </div>
          )}

          {/* Timer */}
          <div className="space-y-3">
            <p className="text-4xl font-mono text-zinc-300 tabular-nums">
              {formatTime(elapsed)}
            </p>
            <button
              onClick={toggleTimer}
              className={`px-8 py-2.5 rounded-full text-sm font-medium transition-colors ${
                running
                  ? "bg-zinc-700 hover:bg-zinc-600 text-zinc-300"
                  : "bg-white/10 hover:bg-white/15 text-zinc-200"
              }`}
            >
              {running ? "Pause" : elapsed > 0 ? "Resume" : "Start"}
            </button>
          </div>

          {/* Up next preview */}
          {allItems.length > 1 && (
            <p className="text-[10px] text-zinc-700">
              {allItems.length - 1} more item{allItems.length - 1 > 1 ? "s" : ""} after this
            </p>
          )}
        </div>
      </main>

      {/* Bottom actions */}
      <footer className="px-6 py-6 flex items-center justify-center gap-4">
        <button
          onClick={skipToNext}
          className="px-5 py-2 bg-zinc-800/50 hover:bg-zinc-800 text-zinc-500 text-xs font-medium rounded-lg transition-colors"
        >
          Skip
        </button>
        <button
          onClick={markDone}
          className="px-8 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 text-sm font-medium rounded-lg transition-colors"
        >
          Done
        </button>
      </footer>
    </div>
  );
}
