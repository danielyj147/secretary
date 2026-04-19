"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Item, CATEGORY_COLORS } from "@/lib/types";
import { liveUrgency } from "@/lib/urgency";

interface EisenhowerPlaneProps {
  items: Item[];
  onItemClick: (item: Item) => void;
  onItemDrag: (itemId: string, urgency: number, importance: number) => void;
  activeFilters: Set<string>;
}

const DOT_RADIUS = 10;
const LABEL_STYLE = "fill-zinc-600 text-[11px] font-medium";

export default function EisenhowerPlane({
  items,
  onItemClick,
  onItemDrag,
  activeFilters,
}: EisenhowerPlaneProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dragging, setDragging] = useState<string | null>(null);
  const [dragPos, setDragPos] = useState<{ x: number; y: number } | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState({ width: 600, height: 400 });
  const [, setTick] = useState(0);

  // Re-render every 60s so live urgency updates smoothly
  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 60_000);
    return () => clearInterval(interval);
  }, []);

  const containerRef = useCallback((node: HTMLDivElement | null) => {
    if (!node) return;
    const observer = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setDimensions({ width, height });
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const PADDING = dimensions.width < 400 ? 28 : 48;
  const plotW = dimensions.width - PADDING * 2;
  const plotH = dimensions.height - PADDING * 2;

  function toSvgX(urgency: number) {
    return PADDING + urgency * plotW;
  }

  function toSvgY(importance: number) {
    return PADDING + (1 - importance) * plotH;
  }

  function fromSvg(clientX: number, clientY: number) {
    const svg = svgRef.current;
    if (!svg) return { urgency: 0.5, importance: 0.5 };
    const rect = svg.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const urgency = Math.max(0, Math.min(1, (x - PADDING) / plotW));
    const importance = Math.max(0, Math.min(1, 1 - (y - PADDING) / plotH));
    return { urgency, importance };
  }

  function handlePointerDown(e: React.PointerEvent, item: Item) {
    e.preventDefault();
    e.stopPropagation();
    setDragging(item.id);
    setDragPos({ x: toSvgX(item.urgency), y: toSvgY(item.importance) });
    (e.target as SVGElement).setPointerCapture(e.pointerId);
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (!dragging) return;
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const x = Math.max(PADDING, Math.min(PADDING + plotW, e.clientX - rect.left));
    const y = Math.max(PADDING, Math.min(PADDING + plotH, e.clientY - rect.top));
    setDragPos({ x, y });
  }

  function handlePointerUp(e: React.PointerEvent) {
    if (!dragging) return;
    const { urgency, importance } = fromSvg(e.clientX, e.clientY);
    onItemDrag(dragging, Math.round(urgency * 100) / 100, Math.round(importance * 100) / 100);
    setDragging(null);
    setDragPos(null);
  }

  const filtered = items.filter(
    (i) => i.status === "active" && (activeFilters.size === 0 || activeFilters.has(i.category))
  );

  return (
    <div ref={containerRef} className="w-full h-full">
      <svg
        ref={svgRef}
        width={dimensions.width}
        height={dimensions.height}
        className="select-none"
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        {/* Quadrant tinting */}
        <rect
          x={PADDING + plotW / 2}
          y={PADDING}
          width={plotW / 2}
          height={plotH / 2}
          fill="rgba(239, 68, 68, 0.03)"
        />
        <rect
          x={PADDING}
          y={PADDING}
          width={plotW / 2}
          height={plotH / 2}
          fill="rgba(59, 130, 246, 0.03)"
        />
        <rect
          x={PADDING + plotW / 2}
          y={PADDING + plotH / 2}
          width={plotW / 2}
          height={plotH / 2}
          fill="rgba(245, 158, 11, 0.03)"
        />
        <rect
          x={PADDING}
          y={PADDING + plotH / 2}
          width={plotW / 2}
          height={plotH / 2}
          fill="rgba(107, 114, 128, 0.03)"
        />

        {/* Grid lines */}
        <line
          x1={PADDING + plotW / 2}
          y1={PADDING}
          x2={PADDING + plotW / 2}
          y2={PADDING + plotH}
          stroke="rgba(63, 63, 70, 0.4)"
          strokeDasharray="4 4"
        />
        <line
          x1={PADDING}
          y1={PADDING + plotH / 2}
          x2={PADDING + plotW}
          y2={PADDING + plotH / 2}
          stroke="rgba(63, 63, 70, 0.4)"
          strokeDasharray="4 4"
        />

        {/* Axis labels — y-axis */}
        <text x={PADDING - 4} y={PADDING + 4} textAnchor="end" className={LABEL_STYLE}>
          High
        </text>
        <text x={PADDING - 4} y={PADDING + plotH} textAnchor="end" className={LABEL_STYLE}>
          Low
        </text>
        {/* Axis labels — x-axis */}
        <text x={PADDING} y={PADDING + plotH + 20} className={LABEL_STYLE}>
          Can wait
        </text>
        <text
          x={PADDING + plotW}
          y={PADDING + plotH + 20}
          textAnchor="end"
          className={LABEL_STYLE}
        >
          Urgent
        </text>
        {/* Axis titles */}
        <text
          x={PADDING + plotW / 2}
          y={PADDING - 8}
          textAnchor="middle"
          className="fill-zinc-600 text-[10px] font-medium uppercase tracking-wider"
        >
          Importance
        </text>

        {/* Quadrant labels */}
        <text
          x={PADDING + plotW * 0.75}
          y={PADDING + plotH * 0.08}
          textAnchor="middle"
          className="fill-zinc-700 text-[10px] font-medium uppercase tracking-wider"
        >
          Do First
        </text>
        <text
          x={PADDING + plotW * 0.25}
          y={PADDING + plotH * 0.08}
          textAnchor="middle"
          className="fill-zinc-700 text-[10px] font-medium uppercase tracking-wider"
        >
          Schedule
        </text>
        <text
          x={PADDING + plotW * 0.75}
          y={PADDING + plotH * 0.96}
          textAnchor="middle"
          className="fill-zinc-700 text-[10px] font-medium uppercase tracking-wider"
        >
          Delegate
        </text>
        <text
          x={PADDING + plotW * 0.25}
          y={PADDING + plotH * 0.96}
          textAnchor="middle"
          className="fill-zinc-700 text-[10px] font-medium uppercase tracking-wider"
        >
          Drop
        </text>

        {/* Item dots */}
        {filtered.map((item) => {
          const isDragging = dragging === item.id;
          const cx = isDragging && dragPos ? dragPos.x : toSvgX(liveUrgency(item));
          const cy = isDragging && dragPos ? dragPos.y : toSvgY(item.importance);
          const color = CATEGORY_COLORS[item.category];
          const isHovered = hoveredId === item.id;

          // Stale: active 3+ days, high importance, no user remarks
          const ageHours =
            (Date.now() - new Date(item.created_at).getTime()) / (1000 * 60 * 60);
          const isStale =
            ageHours > 72 && item.importance > 0.5 && !item.user_remarks;

          return (
            <g key={item.id}>
              {/* Stale pulse ring */}
              {isStale && !isDragging && (
                <circle
                  cx={cx}
                  cy={cy}
                  r={DOT_RADIUS + 5}
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth={1.5}
                  opacity={0.5}
                  className="animate-pulse"
                />
              )}
              {/* Glow on hover */}
              {isHovered && (
                <circle
                  cx={cx}
                  cy={cy}
                  r={DOT_RADIUS + 6}
                  fill={color}
                  opacity={0.15}
                />
              )}
              {/* Dot */}
              <circle
                cx={cx}
                cy={cy}
                r={isDragging ? DOT_RADIUS + 2 : DOT_RADIUS}
                fill={color}
                opacity={isDragging ? 0.9 : 0.8}
                stroke={item.user_remarks ? "white" : "none"}
                strokeWidth={item.user_remarks ? 2 : 0}
                className="cursor-grab active:cursor-grabbing transition-[r] duration-100"
                onPointerDown={(e) => handlePointerDown(e, item)}
                onPointerEnter={() => setHoveredId(item.id)}
                onPointerLeave={() => setHoveredId(null)}
                onClick={() => {
                  if (!isDragging) onItemClick(item);
                }}
              />
              {/* Title label on hover */}
              {isHovered && !isDragging && (
                <text
                  x={cx}
                  y={cy - DOT_RADIUS - 8}
                  textAnchor="middle"
                  className="fill-zinc-200 text-xs font-medium pointer-events-none"
                >
                  {item.title.length > 30
                    ? item.title.slice(0, 30) + "..."
                    : item.title}
                </text>
              )}
              {/* Override indicator */}
              {item.user_override && (
                <circle
                  cx={cx + DOT_RADIUS - 2}
                  cy={cy - DOT_RADIUS + 2}
                  r={3}
                  fill="white"
                  className="pointer-events-none"
                />
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
