"use client";

import { Category, CATEGORY_COLORS } from "@/lib/types";

const CATEGORIES: Category[] = [
  "academic",
  "recruiting",
  "personal",
  "social",
  "financial",
  "health",
];

interface CategoryFilterProps {
  activeFilters: Set<string>;
  onToggle: (category: string) => void;
  counts: Record<string, number>;
}

export default function CategoryFilter({
  activeFilters,
  onToggle,
  counts,
}: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {CATEGORIES.map((cat) => {
        const active = activeFilters.size === 0 || activeFilters.has(cat);
        const count = counts[cat] || 0;
        const color = CATEGORY_COLORS[cat];

        return (
          <button
            key={cat}
            onClick={() => onToggle(cat)}
            className={`inline-flex items-center gap-1 px-2 py-0.5 sm:gap-1.5 sm:px-2.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium transition-all ${
              active
                ? "opacity-100"
                : "opacity-30 hover:opacity-50"
            }`}
            style={{
              backgroundColor: active ? `${color}20` : "transparent",
              color: color,
              border: `1px solid ${active ? `${color}40` : `${color}20`}`,
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: color }}
            />
            {cat}
            {count > 0 && (
              <span className="opacity-60">{count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
