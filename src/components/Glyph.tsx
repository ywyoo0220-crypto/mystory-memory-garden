import type { Category } from "@/lib/data";

const topicPaths: Record<string, React.ReactNode> = {
  T1: <path d="M5 19V11a4 4 0 0 1 4-4h9m-4-4 4 4-4 4" />,
  T2: <path d="M4 11 12 4l8 7v9H4z M10 20v-5h4v5" />,
  T3: (
    <>
      <rect x="4" y="8" width="16" height="11" rx="1.5" />
      <path d="M9 8V5h6v3" />
    </>
  ),
  T4: <path d="M12 19s-7-4.3-7-9.5A3.8 3.8 0 0 1 12 7a3.8 3.8 0 0 1 7 2.5C19 14.7 12 19 12 19z" />,
  T5: <path d="M12 5v14M5 12h14" />,
  T6: <path d="M3 19 10 7l4 6 2-3 5 9z" />,
  T7: (
    <>
      <circle cx="9" cy="12" r="5" />
      <circle cx="15" cy="12" r="5" />
    </>
  ),
  T8: <path d="M6 20V11a6 6 0 0 1 12 0v9" />,
  T9: <path d="M12 3l3 9-3 9-3-9z M3 12h18" />,
  T10: <path d="M15 4a8 8 0 1 0 5 13A7 7 0 0 1 15 4z" />,
};

export function Glyph({ cat, size = 16, color }: { cat: Category; size?: number; color: string }) {
  if (cat.kind === "period") {
    const f = (cat.index + 1) / 9;
    const a = f * Math.PI * 2;
    const x = 12 + 9 * Math.sin(a);
    const y = 12 - 9 * Math.cos(a);
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
        <circle cx="12" cy="12" r="9" fill="none" stroke={color} strokeWidth="1.8" />
        {f >= 1 ? (
          <circle cx="12" cy="12" r="9" fill={color} />
        ) : (
          <path d={`M12 12V3A9 9 0 0 ${f > 0.5 ? 1 : 0} 1 ${x} ${y}Z`} fill={color} />
        )}
      </svg>
    );
  }
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {topicPaths[cat.id]}
    </svg>
  );
}
