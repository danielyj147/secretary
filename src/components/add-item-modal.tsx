"use client";

import { useState } from "react";
import { Category } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";

const CATEGORIES: Category[] = [
  "academic",
  "recruiting",
  "personal",
  "social",
  "financial",
  "health",
];

interface AddItemModalProps {
  onClose: () => void;
  onAdded: () => void;
}

export default function AddItemModal({ onClose, onAdded }: AddItemModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<Category>("personal");
  const [dueAt, setDueAt] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    setSaving(true);
    const supabase = createClient();
    await supabase.from("items").insert({
      title: title.trim(),
      description: description.trim() || null,
      category,
      source_type: "manual",
      due_at: dueAt || null,
      urgency: 0.5,
      importance: 0.5,
    });
    setSaving(false);
    onAdded();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <form
        onSubmit={handleSubmit}
        className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4"
      >
        <h2 className="text-base font-semibold text-zinc-100">Add item</h2>

        <div>
          <label className="block text-xs text-zinc-500 mb-1">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            autoFocus
            className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />
        </div>

        <div>
          <label className="block text-xs text-zinc-500 mb-1">
            Description (optional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-zinc-500 mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as Category)}
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-zinc-500 mb-1">
              Due (optional)
            </label>
            <input
              type="datetime-local"
              value={dueAt}
              onChange={(e) => setDueAt(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2 px-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-medium rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving || !title.trim()}
            className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
          >
            {saving ? "Adding..." : "Add"}
          </button>
        </div>
      </form>
    </div>
  );
}
