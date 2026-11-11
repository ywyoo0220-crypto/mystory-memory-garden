import type { Category } from "@/lib/data";

// Filled (solid) icons on a 24 grid — no strokes, shapes read as one mass.
const topicPaths: Record<string, React.ReactNode> = {
  // 인생의 전환점 — a path that forks
  T1: (
    <>
      <path d="M10.9 21h2.2v-5.4l4.9-4.6a3.2 3.2 0 0 0-1.2-1.9l-4.8 4.5-4.8-4.5A3.2 3.2 0 0 0 6 11l4.9 4.6Z" />
      <circle cx="6" cy="7.6" r="2" />
      <circle cx="18" cy="7.6" r="2" />
    </>
  ),
  // 가족 — house with a window light
  T2: (
    <path
      fillRule="evenodd"
      d="M12 3.6 3.4 10.6a1 1 0 0 0 1.25 1.56l.85-.64V19a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-7.48l.85.64a1 1 0 0 0 1.25-1.56Zm-2.2 8.2h4.4v4.4H9.8Z"
    />
  ),
  // 일과 역할 — briefcase
  T3: (
    <path
      fillRule="evenodd"
      d="M9.2 6.2A2 2 0 0 1 11.2 4.2h1.6a2 2 0 0 1 2 2v1.3h3.7a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5.5a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h3.7Zm1.4 0v1.3h2.8V6.2ZM3.5 12.1h17v-1.1h-17Z"
    />
  ),
  // 사랑과 증오 — heart
  T4: (
    <path d="M12 19.75c-4.8-3.2-8.25-6.3-8.25-10A4.35 4.35 0 0 1 12 7.35a4.35 4.35 0 0 1 8.25 2.4c0 3.7-3.45 6.8-8.25 10Z" />
  ),
  // 건강 — heartbeat line in a circle
  T5: (
    <path
      fillRule="evenodd"
      d="M12 3.25a8.75 8.75 0 1 0 0 17.5 8.75 8.75 0 0 0 0-17.5Zm-2.1 5.1-1.9 3.8H6.5a1 1 0 1 0 0 2h2.1l1.3-2.6 2.5 5 1.9-3.4h3.2a1 1 0 1 0 0-2h-3.8l-1.3 2.4-2.5-5.2Z"
    />
  ),
  // 고난과 역경 — mountain with summit flag
  T6: (
    <>
      <path d="M2.5 19.5 9.5 8.2l3.6 5.6 2-3.1 6.4 8.8Z" />
      <path d="M9.5 3.6v4.4l3.4-1.4v2.2L9.5 10.2V3.6Z" />
    </>
  ),
  // 인간관계 — two interlocking rings
  T7: (
    <path
      fillRule="evenodd"
      d="M9 6.25a5.75 5.75 0 1 0 0 11.5 5.75 5.75 0 0 0 0-11.5Zm0 2a3.75 3.75 0 1 1 0 7.5 3.75 3.75 0 0 1 0-7.5Zm6-2a5.75 5.75 0 1 0 0 11.5 5.75 5.75 0 0 0 0-11.5Zm0 2a3.75 3.75 0 1 1 0 7.5 3.75 3.75 0 0 1 0-7.5Z"
    />
  ),
  // 학문과 예술 — open book
  T8: (
    <path
      fillRule="evenodd"
      d="M12 6.2C9.9 4.7 7 4.2 3.6 4.45v13.1c3.4-.25 6.3.25 8.4 1.75 2.1-1.5 5-2 8.4-1.75V4.45C17 4.2 14.1 4.7 12 6.2Zm-1 11.4V7.5c-1.7-1.1-4-1.5-6.4-1.3v10.1c2.4-.2 4.7.2 6.4 1.3Zm2 0c1.7-1.1 4-1.5 6.4-1.3V6.2c-2.4-.2-4.7.2-6.4 1.3Z"
    />
  ),
  // 신념과 가치관 — compass star
  T9: (
    <path
      fillRule="evenodd"
      d="M12 3.25a8.75 8.75 0 1 0 0 17.5 8.75 8.75 0 0 0 0-17.5Zm2 5.35-1.6 4-4 1.6 1.6-4Zm-2 4.6a1.2 1.2 0 1 1 0-2.4 1.2 1.2 0 0 1 0 2.4Z"
    />
  ),
  // 이별과 죽음 — crescent with a small star
  T10: (
    <>
      <path d="M16.9 18.3A8 8 0 0 1 9.9 4.1a8 8 0 1 0 10 10 8 8 0 0 1-3 4.2Z" />
      <path d="M17.4 3.6l.55 1.5 1.5.55-1.5.55-.55 1.5-.55-1.5-1.5-.55 1.5-.55Z" />
    </>
  ),
};

export function Glyph({ cat, size = 16, color }: { cat: Category; size?: number; color: string }) {
  if (cat.kind === "period") {
    // Filled pie growing with life stage over a faint full disc.
    const f = (cat.index + 1) / 9;
    const angle = f * 360;
    const rad = ((angle - 90) * Math.PI) / 180;
    const x = 12 + 8.5 * Math.cos(rad);
    const y = 12 + 8.5 * Math.sin(rad);
    const large = angle > 180 ? 1 : 0;
    const wedge =
      f >= 1
        ? `<circle cx="12" cy="12" r="8.5"/>`
        : `M12 12 L12 3.5 A8.5 8.5 0 ${large} 1 ${x.toFixed(2)} ${y.toFixed(2)} Z`;
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
        <circle cx="12" cy="12" r="8.5" fill={color} fillOpacity={0.22} />
        <path d={wedge} fill={color} />
      </svg>
    );
  }
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} aria-hidden>
      {topicPaths[cat.id]}
    </svg>
  );
}
