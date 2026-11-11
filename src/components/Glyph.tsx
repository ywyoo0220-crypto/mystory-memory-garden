import type { Category } from "@/lib/data";

// Refined minimal line icons on a 24 grid, 2.1 stroke, round caps.
const topicPaths: Record<string, React.ReactNode> = {
  // 인생의 전환점 — a path that forks
  T1: (
    <>
      <path d="M12 21v-7" />
      <path d="M12 14c0-4-3-5.5-6-6.5" />
      <path d="M12 14c0-4 3-5.5 6-6.5" />
      <circle cx="6" cy="6.5" r="1.6" />
      <circle cx="18" cy="6.5" r="1.6" />
    </>
  ),
  // 가족 — house with a window light
  T2: (
    <>
      <path d="M4.5 10.5 12 4.5l7.5 6" />
      <path d="M6.5 9v10.5h11V9" />
      <path d="M10.25 19.5v-4.25h3.5v4.25" />
    </>
  ),
  // 일과 역할 — briefcase
  T3: (
    <>
      <rect x="3.75" y="7.5" width="16.5" height="11.5" rx="2.5" />
      <path d="M9 7.5V6a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 15 6v1.5" />
      <path d="M3.75 12.5h16.5" />
    </>
  ),
  // 사랑과 증오 — two overlapping arcs forming a heart
  T4: (
    <path d="M12 19.25c-4.5-3-7.75-5.9-7.75-9.4A4.1 4.1 0 0 1 12 7.6a4.1 4.1 0 0 1 7.75 2.25c0 3.5-3.25 6.4-7.75 9.4Z" />
  ),
  // 건강 — heartbeat line in a circle
  T5: (
    <>
      <circle cx="12" cy="12" r="8.25" />
      <path d="M6.5 12.5h2.5l1.5-3 3 6 1.5-3h2.5" />
    </>
  ),
  // 고난과 역경 — mountain with summit flag
  T6: (
    <>
      <path d="M3 19.5 9.5 9l3.5 5.5 2-3 6 8Z" />
      <path d="M9.5 9V4.5l3 1.25-3 1.25" />
    </>
  ),
  // 인간관계 — two interlocking rings
  T7: (
    <>
      <circle cx="9" cy="12" r="5.25" />
      <circle cx="15" cy="12" r="5.25" />
    </>
  ),
  // 학문과 예술 — open book
  T8: (
    <>
      <path d="M12 7c-2-1.5-4.75-2-8-1.75v12.5c3.25-.25 6 .25 8 1.75 2-1.5 4.75-2 8-1.75V5.25C16.75 5 14 5.5 12 7Z" />
      <path d="M12 7v12.5" />
    </>
  ),
  // 신념과 가치관 — compass star
  T9: (
    <>
      <circle cx="12" cy="12" r="8.25" />
      <path d="M12 6.5 13.6 12 12 17.5 10.4 12Z" />
    </>
  ),
  // 이별과 죽음 — crescent with a small star
  T10: (
    <>
      <path d="M16.5 17.8A7.5 7.5 0 0 1 10 4.6a7.5 7.5 0 1 0 9.4 9.4 7.5 7.5 0 0 1-2.9 3.8Z" />
      <path d="M17.5 5v3M16 6.5h3" />
    </>
  ),
};

export function Glyph({ cat, size = 16, color }: { cat: Category; size?: number; color: string }) {
  if (cat.kind === "period") {
    // Dial gauge: faint track + filled arc proportional to life stage, with 9 ticks.
    const f = (cat.index + 1) / 9;
    const r = 7.5;
    const c = 2 * Math.PI * r;
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
        <circle cx="12" cy="12" r={r} stroke={color} strokeOpacity={0.3} strokeWidth="4" />
        <circle
          cx="12"
          cy="12"
          r={r}
          stroke={color}
          strokeWidth="4"
          strokeLinecap={f >= 1 ? "butt" : "round"}
          strokeDasharray={`${c * f} ${c}`}
          transform="rotate(-90 12 12)"
        />
        <circle cx="12" cy="12" r="2" fill={color} />
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
      strokeWidth="2.1"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {topicPaths[cat.id]}
    </svg>
  );
}
