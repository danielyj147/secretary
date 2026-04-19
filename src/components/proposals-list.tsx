"use client";

import { Proposal } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";

interface ProposalsListProps {
  proposals: Proposal[];
  onUpdate: () => void;
}

const ACTION_LABELS: Record<string, string> = {
  calendar_block: "Block time",
  email_draft: "Draft email",
  reschedule: "Reschedule",
  drop: "Drop item",
  other: "Action",
};

export default function ProposalsList({
  proposals,
  onUpdate,
}: ProposalsListProps) {
  const pending = proposals.filter((p) => p.status === "pending");
  const supabase = createClient();

  if (pending.length === 0) return null;

  async function respond(id: string, status: "approved" | "rejected") {
    await supabase
      .from("proposals")
      .update({ status, resolved_at: new Date().toISOString() })
      .eq("id", id);
    onUpdate();
  }

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-zinc-400">
        Pending Proposals
        <span className="ml-1.5 text-[10px] text-amber-400 font-normal">
          {pending.length}
        </span>
      </h3>

      <div className="space-y-2">
        {pending.map((p) => (
          <div
            key={p.id}
            className="bg-zinc-800/60 border border-zinc-700/50 rounded-lg p-3 space-y-2"
          >
            <div className="flex items-start gap-2">
              <span className="text-[9px] uppercase tracking-wider text-amber-400/80 bg-amber-400/10 px-1.5 py-0.5 rounded font-medium flex-shrink-0 mt-0.5">
                {ACTION_LABELS[p.action_type] || p.action_type}
              </span>
              <span className="text-xs text-zinc-300">{p.title}</span>
            </div>
            {p.description && (
              <p className="text-[11px] text-zinc-500 leading-relaxed">
                {p.description}
              </p>
            )}
            <div className="flex gap-2">
              <button
                onClick={() => respond(p.id, "approved")}
                className="flex-1 py-1 px-2 bg-emerald-600/15 hover:bg-emerald-600/25 text-emerald-400 text-[10px] font-medium rounded transition-colors"
              >
                Approve
              </button>
              <button
                onClick={() => respond(p.id, "rejected")}
                className="flex-1 py-1 px-2 bg-zinc-700/50 hover:bg-zinc-700 text-zinc-500 text-[10px] font-medium rounded transition-colors"
              >
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
