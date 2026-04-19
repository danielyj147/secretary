"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Item, SecretaryNote, AgentRun, DayPlan, Proposal } from "@/lib/types";
import EisenhowerPlane from "@/components/eisenhower-plane";
import ItemDetailPanel from "@/components/item-detail-panel";
import AddItemModal from "@/components/add-item-modal";
import SecretaryNotes from "@/components/secretary-notes";
import DayTimeline from "@/components/day-timeline";
import LastRunCard from "@/components/last-run-card";
import CategoryFilter from "@/components/category-filter";
import WorkloadChart from "@/components/workload-chart";
import CompletionStats from "@/components/completion-stats";
import ProposalsList from "@/components/proposals-list";

type MobileTab = "matrix" | "plan" | "notes";

export default function Dashboard() {
  const [items, setItems] = useState<Item[]>([]);
  const [notes, setNotes] = useState<SecretaryNote[]>([]);
  const [lastRun, setLastRun] = useState<AgentRun | null>(null);
  const [todayPlan, setTodayPlan] = useState<DayPlan | null>(null);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set());
  const [mobileTab, setMobileTab] = useState<MobileTab>("matrix");
  const router = useRouter();

  const supabase = createClient();

  const loadData = useCallback(async () => {
    const todayLocal = new Date();
    const todayStr = `${todayLocal.getFullYear()}-${String(todayLocal.getMonth() + 1).padStart(2, "0")}-${String(todayLocal.getDate()).padStart(2, "0")}`;

    const [itemsRes, notesRes, runsRes, planRes, proposalsRes] =
      await Promise.all([
        supabase
          .from("items")
          .select("*")
          .in("status", ["active", "waiting"])
          .order("created_at", { ascending: false }),
        supabase
          .from("secretary_notes")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(10),
        supabase
          .from("agent_runs")
          .select("*")
          .order("started_at", { ascending: false })
          .limit(1),
        supabase
          .from("day_plans")
          .select("*")
          .eq("plan_date", todayStr)
          .maybeSingle(),
        supabase
          .from("proposals")
          .select("*")
          .eq("status", "pending")
          .order("created_at", { ascending: false }),
      ]);

    if (itemsRes.data) setItems(itemsRes.data);
    if (notesRes.data) setNotes(notesRes.data);
    if (runsRes.data?.[0]) setLastRun(runsRes.data[0]);
    if (planRes.data) setTodayPlan(planRes.data);
    if (proposalsRes.data) setProposals(proposalsRes.data);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleItemDrag(
    itemId: string,
    urgency: number,
    importance: number
  ) {
    await supabase
      .from("items")
      .update({ urgency, importance, user_override: true })
      .eq("id", itemId);
    loadData();
  }

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

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const pendingCount = proposals.filter((p) => p.status === "pending").length;

  return (
    <div className="h-dvh bg-zinc-950 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="border-b border-zinc-800 px-4 sm:px-6 py-2.5 flex items-center justify-between flex-shrink-0">
        <h1 className="text-sm sm:text-base font-semibold text-zinc-100">
          Secretary
        </h1>
        <div className="flex items-center gap-2 sm:gap-4">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-2.5 py-1 sm:px-3 sm:py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[11px] sm:text-xs font-medium rounded-lg transition-colors"
          >
            + Add
          </button>
          <Link
            href="/focus"
            className="text-[11px] sm:text-xs text-emerald-500/80 hover:text-emerald-400 font-medium transition-colors"
          >
            Focus
          </Link>
          <Link
            href="/agenda"
            className="text-[11px] sm:text-xs text-zinc-500 hover:text-zinc-300 transition-colors hidden sm:block"
          >
            Agenda
          </Link>
          <Link
            href="/log"
            className="text-[11px] sm:text-xs text-zinc-500 hover:text-zinc-300 transition-colors hidden sm:block"
          >
            Log
          </Link>
          <button
            onClick={handleSignOut}
            className="text-[11px] sm:text-xs text-zinc-600 hover:text-zinc-400 transition-colors hidden sm:block"
          >
            Sign out
          </button>
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

      {/* Main content — desktop: side by side, mobile: tabbed */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden">
        {/* Eisenhower plane — always visible on desktop, tab on mobile */}
        <div
          className={`flex-1 min-h-0 flex flex-col ${
            mobileTab !== "matrix" ? "hidden lg:flex" : "flex"
          }`}
        >
          <div className="flex-1 p-2 sm:p-4 min-h-0">
            <EisenhowerPlane
              items={items}
              onItemClick={setSelectedItem}
              onItemDrag={handleItemDrag}
              activeFilters={activeFilters}
            />
          </div>
          {/* Category filter — inside plane area */}
          <div className="px-3 sm:px-6 py-2 border-t border-zinc-800 flex-shrink-0">
            <CategoryFilter
              activeFilters={activeFilters}
              onToggle={toggleFilter}
              counts={categoryCounts}
            />
          </div>
        </div>

        {/* Sidebar — desktop: always visible right panel. Mobile: "plan" and "notes" tabs */}
        <aside
          className={`lg:w-80 lg:border-l border-zinc-800 flex-shrink-0 overflow-y-auto ${
            mobileTab === "matrix" ? "hidden lg:block" : ""
          }`}
        >
          {/* Plan tab content (or top of desktop sidebar) */}
          <div
            className={`p-4 sm:p-5 space-y-5 ${
              mobileTab === "notes" ? "hidden lg:block" : ""
            }`}
          >
            <ProposalsList proposals={proposals} onUpdate={loadData} />

            <div>
              <h3 className="text-sm font-medium text-zinc-400 mb-2">
                Today&apos;s Plan
              </h3>
              <DayTimeline plan={todayPlan} items={items} />
            </div>

            <div className="border-t border-zinc-800" />

            <WorkloadChart items={items} />

            {/* Mobile-only links */}
            <div className="flex gap-3 lg:hidden border-t border-zinc-800 pt-4">
              <Link
                href="/agenda"
                className="flex-1 py-2 text-center text-xs text-zinc-500 bg-zinc-800/50 rounded-lg"
              >
                Agenda
              </Link>
              <Link
                href="/log"
                className="flex-1 py-2 text-center text-xs text-zinc-500 bg-zinc-800/50 rounded-lg"
              >
                Log
              </Link>
            </div>
          </div>

          {/* Notes tab content (or bottom of desktop sidebar) */}
          <div
            className={`p-4 sm:p-5 space-y-5 ${
              mobileTab === "plan" ? "hidden lg:block" : ""
            } ${mobileTab !== "notes" ? "lg:border-t lg:border-zinc-800" : ""}`}
          >
            <SecretaryNotes notes={notes} onNoteAdded={loadData} />

            <div className="border-t border-zinc-800" />

            <CompletionStats />

            <div>
              <h3 className="text-sm font-medium text-zinc-400 mb-2">
                Last Agent Run
              </h3>
              <LastRunCard run={lastRun} />
            </div>

            {/* Mobile sign out */}
            <button
              onClick={handleSignOut}
              className="lg:hidden w-full py-2 text-xs text-zinc-600 hover:text-zinc-400 transition-colors"
            >
              Sign out
            </button>
          </div>
        </aside>
      </div>

      {/* Modals / panels */}
      <ItemDetailPanel
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
        onUpdate={loadData}
      />
      {showAddModal && (
        <AddItemModal
          onClose={() => setShowAddModal(false)}
          onAdded={loadData}
        />
      )}
    </div>
  );
}
