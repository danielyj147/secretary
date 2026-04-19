import { AgentRun } from "@/lib/types";

interface LastRunCardProps {
  run: AgentRun | null;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function LastRunCard({ run }: LastRunCardProps) {
  if (!run) {
    return (
      <div className="text-xs text-zinc-600 italic">
        No agent runs yet.
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
        <span className="text-xs text-zinc-500">
          Last run: {timeAgo(run.started_at)}
        </span>
      </div>
      {run.summary && (
        <p className="text-xs text-zinc-400 leading-relaxed pl-3.5">
          {run.summary}
        </p>
      )}
      <div className="flex gap-3 pl-3.5 text-[10px] text-zinc-600">
        {run.items_created > 0 && <span>+{run.items_created} new</span>}
        {run.items_updated > 0 && <span>{run.items_updated} updated</span>}
        {run.items_completed > 0 && <span>{run.items_completed} done</span>}
      </div>
    </div>
  );
}
