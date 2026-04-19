"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { AgentRun, ItemChange } from "@/lib/types";

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function LogPage() {
  const [runs, setRuns] = useState<AgentRun[]>([]);
  const [expandedRun, setExpandedRun] = useState<string | null>(null);
  const [changes, setChanges] = useState<ItemChange[]>([]);
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("agent_runs")
        .select("*")
        .order("started_at", { ascending: false })
        .limit(20);
      if (data) setRuns(data);
    }
    load();
  }, []);

  async function toggleExpand(runId: string) {
    if (expandedRun === runId) {
      setExpandedRun(null);
      return;
    }
    setExpandedRun(runId);
    const { data } = await supabase
      .from("item_changes")
      .select("*")
      .eq("run_id", runId)
      .order("created_at");
    if (data) setChanges(data);
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      <header className="border-b border-zinc-800 px-6 py-3 flex items-center gap-4">
        <Link
          href="/"
          className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          &larr; Dashboard
        </Link>
        <h1 className="text-base font-semibold text-zinc-100">Agent Log</h1>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-8 space-y-4">
        {runs.length === 0 ? (
          <p className="text-sm text-zinc-600 italic">No agent runs yet.</p>
        ) : (
          runs.map((run) => (
            <div
              key={run.id}
              className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden"
            >
              <button
                onClick={() => toggleExpand(run.id)}
                className="w-full text-left px-5 py-4 hover:bg-zinc-800/50 transition-colors"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-zinc-400">
                    {formatTime(run.started_at)}
                  </span>
                  <div className="flex gap-3 text-[10px] text-zinc-600">
                    {run.items_created > 0 && (
                      <span className="text-emerald-600">
                        +{run.items_created} new
                      </span>
                    )}
                    {run.items_updated > 0 && (
                      <span className="text-blue-600">
                        {run.items_updated} updated
                      </span>
                    )}
                    {run.items_completed > 0 && (
                      <span className="text-amber-600">
                        {run.items_completed} done
                      </span>
                    )}
                  </div>
                </div>
                {run.summary && (
                  <p className="text-sm text-zinc-300 leading-relaxed">
                    {run.summary}
                  </p>
                )}
              </button>

              {expandedRun === run.id && changes.length > 0 && (
                <div className="border-t border-zinc-800 px-5 py-3 space-y-2">
                  {changes.map((change) => (
                    <div
                      key={change.id}
                      className="flex items-start gap-2 text-xs"
                    >
                      <span
                        className={`px-1.5 py-0.5 rounded font-mono text-[10px] ${
                          change.change_type === "created"
                            ? "bg-emerald-900/40 text-emerald-400"
                            : change.change_type === "completed"
                            ? "bg-amber-900/40 text-amber-400"
                            : "bg-blue-900/40 text-blue-400"
                        }`}
                      >
                        {change.change_type}
                      </span>
                      <span className="text-zinc-400 flex-1">
                        {change.reason || change.field_changed}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </main>
    </div>
  );
}
