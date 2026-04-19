"use client";

import { useState } from "react";
import Link from "next/link";
import { Item, Proposal } from "@/lib/types";
import {
  DEMO_ITEMS,
  DEMO_NOTES,
  DEMO_LAST_RUN,
  DEMO_TODAY_PLAN,
  DEMO_PROPOSALS,
} from "@/lib/demo-data";
import EisenhowerPlane from "@/components/eisenhower-plane";
import ItemDetailPanel from "@/components/item-detail-panel";
import DayTimeline from "@/components/day-timeline";
import LastRunCard from "@/components/last-run-card";
import CategoryFilter from "@/components/category-filter";
import WorkloadChart from "@/components/workload-chart";
import ProposalsList from "@/components/proposals-list";

type MobileTab = "matrix" | "plan" | "notes";

export default function DemoPage() {
  const [items] = useState<Item[]>(DEMO_ITEMS);
  const [proposals] = useState<Proposal[]>(DEMO_PROPOSALS);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set());
  const [mobileTab, setMobileTab] = useState<MobileTab>("matrix");

  function toggleFilter(category: string) {
    setActiveFilters((prev) => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  }

  const categoryCounts = items.reduce<Record<string, number>>((acc, item) => {
    if (item.status === "active") {
      acc[item.category] = (acc[item.category] || 0) + 1;
    }
    return acc;
  }, {});

  const pendingCount = proposals.filter((p) => p.status === "pending").length;

  return (
    <div className="h-dvh bg-zinc-950 flex flex-col overflow-hidden">
      {/* Demo banner */}
      <div className="bg-blue-600/10 border-b border-blue-500/20 px-4 py-2 flex items-center justify-between flex-shrink-0">
        <span className="text-xs text-blue-400">
          Demo mode — sample data from a fictional student&apos;s finals week
        </span>
        <Link
          href="/login"
          className="text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors"
        >
          Sign in &rarr;
        </Link>
      </div>

      {/* Header */}
      <header className="border-b border-zinc-800 px-4 sm:px-6 py-2.5 flex items-center justify-between flex-shrink-0">
        <h1 className="text-sm sm:text-base font-semibold text-zinc-100">
          Secretary
        </h1>
        <div className="flex items-center gap-2 sm:gap-4">
          <span className="px-2.5 py-1 bg-zinc-800 text-zinc-500 text-[11px] sm:text-xs font-medium rounded-lg cursor-default">
            + Add
          </span>
          <span className="text-[11px] sm:text-xs text-emerald-500/50 font-medium cursor-default">
            Focus
          </span>
          <span className="text-[11px] sm:text-xs text-zinc-600 hidden sm:block cursor-default">
            Agenda
          </span>
          <span className="text-[11px] sm:text-xs text-zinc-600 hidden sm:block cursor-default">
            Log
          </span>
        </div>
      </header>

      {/* Mobile tab bar */}
      <nav className="flex lg:hidden border-b border-zinc-800 flex-shrink-0 bg-zinc-950">
        {(
          [
            { key: "matrix" as MobileTab, label: "Matrix", badge: 0 },
            { key: "plan" as MobileTab, label: "Plan", badge: 0 },
            { key: "notes" as MobileTab, label: "Notes", badge: pendingCount },
          ]
        ).map(({ key, label, badge }) => (
          <button
            key={key}
            onClick={() => setMobileTab(key)}
            className={`flex-1 py-2.5 text-[13px] font-medium transition-colors ${
              mobileTab === key
                ? "text-zinc-100 border-b-2 border-white"
                : "text-zinc-500 border-b-2 border-transparent"
            }`}
          >
            {label}
            {badge ? (
              <span className="ml-1 inline-flex items-center justify-center w-4 h-4 text-[9px] bg-amber-500/20 text-amber-400 rounded-full">
                {badge}
              </span>
            ) : null}
          </button>
        ))}
      </nav>

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden">
        {/* Eisenhower plane */}
        <div
          className={`flex-1 min-h-0 flex flex-col ${
            mobileTab !== "matrix" ? "hidden lg:flex" : "flex"
          }`}
        >
          <div className="flex-1 p-2 sm:p-4 min-h-0">
            <EisenhowerPlane
              items={items}
              onItemClick={setSelectedItem}
              onItemDrag={() => {}}
              activeFilters={activeFilters}
            />
          </div>
          <div className="px-3 sm:px-6 py-2 border-t border-zinc-800 flex-shrink-0">
            <CategoryFilter
              activeFilters={activeFilters}
              onToggle={toggleFilter}
              counts={categoryCounts}
            />
          </div>
        </div>

        {/* Sidebar */}
        <aside
          className={`lg:w-80 lg:border-l border-zinc-800 flex-shrink-0 overflow-y-auto ${
            mobileTab === "matrix" ? "hidden lg:block" : ""
          }`}
        >
          {/* Plan tab */}
          <div
            className={`p-4 sm:p-5 space-y-5 ${
              mobileTab === "notes" ? "hidden lg:block" : ""
            }`}
          >
            <ProposalsList proposals={proposals} onUpdate={() => {}} />

            <div>
              <h3 className="text-sm font-medium text-zinc-400 mb-2">
                Today&apos;s Plan
              </h3>
              <DayTimeline plan={DEMO_TODAY_PLAN} items={items} />
            </div>

            <div className="border-t border-zinc-800" />

            <WorkloadChart items={items} />
          </div>

          {/* Notes tab */}
          <div
            className={`p-4 sm:p-5 space-y-5 ${
              mobileTab === "plan" ? "hidden lg:block" : ""
            } ${mobileTab !== "notes" ? "lg:border-t lg:border-zinc-800" : ""}`}
          >
            {/* Secretary notes (read-only display) */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-zinc-400">
                Notes to Secretary
              </h3>
              <div className="space-y-2">
                {DEMO_NOTES.map((note) => (
                  <div
                    key={note.id}
                    className={`text-xs rounded-lg p-2.5 space-y-1 ${
                      note.acknowledged_at
                        ? "bg-zinc-800/50 text-zinc-500"
                        : "bg-zinc-800 text-zinc-300"
                    }`}
                  >
                    <p>{note.content}</p>
                    {note.agent_response && (
                      <p className="text-zinc-500 border-t border-zinc-700 pt-1 mt-1">
                        <span className="text-zinc-600 font-medium">
                          Secretary:
                        </span>{" "}
                        {note.agent_response}
                      </p>
                    )}
                    {!note.acknowledged_at && (
                      <p className="text-zinc-600 italic">
                        Pending next run...
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-zinc-800" />

            <div>
              <h3 className="text-sm font-medium text-zinc-400 mb-2">
                Last Agent Run
              </h3>
              <LastRunCard run={DEMO_LAST_RUN} />
            </div>
          </div>
        </aside>
      </div>

      {/* Detail panel */}
      {selectedItem && (
        <ItemDetailPanel
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onUpdate={() => {}}
        />
      )}
    </div>
  );
}
