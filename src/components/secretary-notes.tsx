"use client";

import { useState } from "react";
import { SecretaryNote } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";

interface SecretaryNotesProps {
  notes: SecretaryNote[];
  onNoteAdded: () => void;
}

export default function SecretaryNotes({ notes, onNoteAdded }: SecretaryNotesProps) {
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;

    setSending(true);
    const supabase = createClient();
    await supabase.from("secretary_notes").insert({ content: content.trim() });
    setContent("");
    setSending(false);
    onNoteAdded();
  }

  const recent = notes.slice(0, 5);

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-zinc-400">Notes to Secretary</h3>

      <form onSubmit={handleSubmit} className="space-y-2">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="e.g. Prioritize recruiting emails this week..."
          rows={2}
          className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 placeholder:text-zinc-600"
        />
        <button
          type="submit"
          disabled={sending || !content.trim()}
          className="w-full py-1.5 px-3 bg-zinc-700 hover:bg-zinc-600 disabled:opacity-40 text-zinc-200 text-xs font-medium rounded-lg transition-colors"
        >
          {sending ? "Sending..." : "Send"}
        </button>
      </form>

      {recent.length > 0 && (
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {recent.map((note) => (
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
                  <span className="text-zinc-600 font-medium">Secretary:</span>{" "}
                  {note.agent_response}
                </p>
              )}
              {!note.acknowledged_at && (
                <p className="text-zinc-600 italic">Pending next run...</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
