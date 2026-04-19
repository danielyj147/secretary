"use client";

import { useState, useEffect } from "react";
import { Item, CATEGORY_BG } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import { liveUrgency } from "@/lib/urgency";

interface ItemDetailPanelProps {
  item: Item | null;
  onClose: () => void;
  onUpdate: () => void;
}

export default function ItemDetailPanel({
  item,
  onClose,
  onUpdate,
}: ItemDetailPanelProps) {
  const [remarks, setRemarks] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setRemarks(item?.user_remarks ?? "");
  }, [item?.id, item?.user_remarks]);

  if (!item) return null;

  async function saveRemarks() {
    if (!item) return;
    setSaving(true);
    const supabase = createClient();
    await supabase
      .from("items")
      .update({ user_remarks: remarks || null })
      .eq("id", item.id);
    setSaving(false);
    onUpdate();
  }

  async function updateStatus(status: string) {
    if (!item) return;
    const supabase = createClient();
    await supabase
      .from("items")
      .update({
        status,
        completed_at: status === "completed" ? new Date().toISOString() : null,
      })
      .eq("id", item.id);
    onUpdate();
    onClose();
  }

  const dueDate = item.due_at
    ? new Date(item.due_at).toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full sm:max-w-md bg-zinc-900 border-l border-zinc-800 p-4 sm:p-6 overflow-y-auto animate-slide-in">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-300 text-lg"
        >
          &times;
        </button>

        <div className="space-y-5">
          {/* Header */}
          <div>
            <span
              className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider mb-2 ${
                CATEGORY_BG[item.category]
              }`}
            >
              {item.category}
            </span>
            <h2 className="text-lg font-semibold text-zinc-100">
              {item.title}
            </h2>
            {item.description && (
              <p className="text-sm text-zinc-400 mt-1.5 leading-relaxed">
                {item.description}
              </p>
            )}
          </div>

          {/* Evidence / source detail */}
          {item.evidence && (
            <div className="bg-zinc-800/40 rounded-lg border border-zinc-800 overflow-hidden">
              <div className="px-3 py-2 border-b border-zinc-800 flex items-center gap-2">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                  {item.source_type === "email"
                    ? "Email thread"
                    : item.source_type === "calendar"
                    ? "Calendar event"
                    : "Evidence"}
                </span>
                {item.source_id && item.source_type === "email" && (
                  <a
                    href={`https://mail.google.com/mail/u/0/#inbox/${item.source_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] text-blue-400 hover:text-blue-300 ml-auto"
                  >
                    Open in Gmail &rarr;
                  </a>
                )}
              </div>
              <div className="px-3 py-2.5 text-xs text-zinc-400 leading-relaxed whitespace-pre-wrap max-h-64 overflow-y-auto">
                {item.evidence}
              </div>
            </div>
          )}

          {/* Meta */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-zinc-800/60 rounded-lg p-2.5">
              <span className="text-zinc-500 block">Urgency</span>
              <span className="text-zinc-200 font-mono">
                {(liveUrgency(item) * 100).toFixed(0)}%
              </span>
            </div>
            <div className="bg-zinc-800/60 rounded-lg p-2.5">
              <span className="text-zinc-500 block">Importance</span>
              <span className="text-zinc-200 font-mono">
                {(item.importance * 100).toFixed(0)}%
              </span>
            </div>
            {dueDate && (
              <div className="bg-zinc-800/60 rounded-lg p-2.5 col-span-2">
                <span className="text-zinc-500 block">Due</span>
                <span className="text-zinc-200">{dueDate}</span>
              </div>
            )}
            <div className="bg-zinc-800/60 rounded-lg p-2.5">
              <span className="text-zinc-500 block">Source</span>
              <span className="text-zinc-200">{item.source_type}</span>
            </div>
            <div className="bg-zinc-800/60 rounded-lg p-2.5">
              <span className="text-zinc-500 block">Status</span>
              <span className="text-zinc-200">{item.status}</span>
            </div>
          </div>

          {/* Status reason from agent */}
          {item.status_reason && (
            <div className="text-xs bg-zinc-800/40 rounded-lg p-3 border border-zinc-800">
              <span className="text-zinc-500 block mb-1 font-medium">
                Agent note
              </span>
              <span className="text-zinc-400">{item.status_reason}</span>
            </div>
          )}

          {/* User remarks */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-400">
              Your remarks
            </label>
            <textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Leave a note for the agent about this item..."
              rows={3}
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 placeholder:text-zinc-600"
            />
            <button
              onClick={saveRemarks}
              disabled={saving || remarks === (item.user_remarks ?? "")}
              className="px-3 py-1.5 bg-zinc-700 hover:bg-zinc-600 disabled:opacity-40 text-zinc-200 text-xs font-medium rounded-lg transition-colors"
            >
              {saving ? "Saving..." : "Save remarks"}
            </button>
          </div>

          {/* Override indicator */}
          {item.user_override && (
            <p className="text-[10px] text-zinc-600 italic">
              You repositioned this item — the agent will respect your
              placement.
            </p>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2 border-t border-zinc-800">
            <button
              onClick={() => updateStatus("completed")}
              className="flex-1 py-1.5 px-3 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 text-xs font-medium rounded-lg transition-colors"
            >
              Mark done
            </button>
            <button
              onClick={() => updateStatus("dismissed")}
              className="flex-1 py-1.5 px-3 bg-zinc-700/50 hover:bg-zinc-700 text-zinc-400 text-xs font-medium rounded-lg transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
