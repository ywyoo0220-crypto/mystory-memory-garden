import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { categoryOfQuestion, getQuestion } from "@/lib/data";
import { filledSteps, type StoryRecord } from "@/lib/store";
import { BackBar } from "@/components/BackBar";

export const Chevron = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden className="shrink-0 text-muted-foreground">
    <path d="m9 5 7 7-7 7" />
  </svg>
);

export function SubHeader({ title, back = "/my", sub }: { title: string; back?: string; sub?: string }) {
  return (
    <div className="no-print">
      <BackLink to={back} />
      <div className="px-6 pb-4 pt-2">
        <h1 className="text-[1.75rem] font-bold leading-[1.3]">{title}</h1>
        {sub && <p className="mt-2 text-[0.9375rem] leading-[1.6] text-muted-foreground">{sub}</p>}
      </div>
    </div>
  );
}
function BackLink({ to }: { to: string }) {
  return (
    <div className="flex h-16 items-center px-2">
      <Link to={to} aria-label="뒤로" className="flex size-12 items-center justify-center rounded-full">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
          <path d="m15 5-7 7 7 7" />
        </svg>
      </Link>
    </div>
  );
}
export { BackBar };

export function Avatar({ name, photo, size }: { name: string; photo?: string | undefined; size: number }) {
  const s = `${size / 16}rem`;
  if (photo) return <img src={photo} alt="프로필 사진" className="shrink-0 rounded-full object-cover" style={{ width: s, height: s }} />;
  return (
    <span
      aria-hidden
      className="flex shrink-0 items-center justify-center rounded-full bg-ink font-bold text-ink-foreground"
      style={{ width: s, height: s, fontSize: `${size / 40}rem` }}
    >
      {name.trim().charAt(0) || "나"}
    </span>
  );
}

export function Segmented<T extends string | number>({ value, options, onChange, label }: { value: T; options: [T, string][]; onChange: (v: T) => void; label: string }) {
  return (
    <div role="group" aria-label={label} className="flex rounded-full border border-ink p-1">
      {options.map(([v, l]) => (
        <button
          key={String(v)}
          type="button"
          aria-pressed={value === v}
          onClick={() => onChange(v)}
          className={`h-12 flex-1 rounded-full px-3 text-[0.9375rem] font-medium transition-colors ${value === v ? "bg-ink text-ink-foreground" : "text-foreground"}`}
        >
          {l}
        </button>
      ))}
    </div>
  );
}

export function Toggle({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button type="button" role="switch" aria-checked={on} aria-label={label} onClick={() => onChange(!on)} className="flex h-12 shrink-0 items-center">
      <span className={`flex h-8 w-14 items-center rounded-full p-1 transition-colors ${on ? "bg-ink" : "bg-[#8E8E93]"}`}>
        <span className={`size-6 rounded-full bg-card transition-transform ${on ? "translate-x-6" : ""}`} />
      </span>
    </button>
  );
}

export const Dot = ({ catId, filled = true, size = 10 }: { catId: string; filled?: boolean; size?: number }) => (
  <span
    aria-hidden
    className="inline-block shrink-0 rounded-full"
    style={{ width: `${size / 16}rem`, height: `${size / 16}rem`, background: filled ? `var(--${catId}-pill)` : "transparent", border: `1.5px solid var(--${catId}-pill)` }}
  />
);

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-[20px] border border-border bg-card ${className}`}>{children}</div>;
}

/** Opens the answer flow at the first empty step. */
export function ContinueCard({ qid, rec }: { qid: string; rec: StoryRecord }) {
  const cat = categoryOfQuestion(qid);
  const q = getQuestion(qid);
  if (!cat || !q) return null;
  const f = filledSteps(rec);
  const first = Math.max(0, f.indexOf(false));
  return (
    <Link to="/answer/$qid" params={{ qid }} search={{ step: first }} className="flex min-h-12 items-center gap-3 rounded-[20px] border border-border bg-card p-4">
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2 text-[0.8125rem] text-muted-foreground">
          <Dot catId={cat.id} />
          {cat.name} · 4단계 중 {f.filter(Boolean).length}단계
        </span>
        <span className="mt-1 block text-[1rem] font-medium leading-[1.5]">{q.core}</span>
      </span>
      <Chevron />
    </Link>
  );
}

export const rowCls = "flex min-h-16 w-full items-center gap-3 px-5 py-3 text-left";
