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

export function SubHeader({ title, back = "/my", sub, close }: { title: string; back?: string; sub?: string; close?: boolean }) {
  return (
    <div className="no-print">
      <BackLink to={back} close={!!close} />
      <div className="px-6 pb-4 pt-2">
        <h1 className="text-title font-medium">{title}</h1>
        {sub && <p className="mt-2 text-caption text-muted-foreground">{sub}</p>}
      </div>
    </div>
  );
}
function BackLink({ to, close }: { to: string; close?: boolean }) {
  return (
    <div className="flex h-16 items-center px-2">
      <Link to={to} aria-label={close ? "닫기" : "뒤로"} className="flex size-12 items-center justify-center rounded-full">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
          <path d={close ? "M6 6l12 12M18 6 6 18" : "m15 5-7 7 7 7"} />
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
      className="flex shrink-0 items-center justify-center rounded-full bg-ink font-medium text-ink-foreground"
      style={{ width: s, height: s, fontSize: `${size / 40}rem` }}
    >
      {name.trim().charAt(0) || "나"}
    </span>
  );
}

export function Segmented<T extends string | number>({ value, options, onChange, label, compact }: { value: T; options: [T, import("react").ReactNode][]; onChange: (v: T) => void; label: string; compact?: boolean }) {
  return (
    <div role="group" aria-label={label} className={compact ? "flex shrink-0 rounded-full bg-muted p-1" : "flex rounded-full border border-ink p-1"}>
      {options.map(([v, l]) => (
        <button
          key={String(v)}
          type="button"
          aria-pressed={value === v}
          onClick={() => onChange(v)}
          className={`${compact ? "h-12 px-4" : "h-12 flex-1 px-4"} rounded-full text-caption font-medium transition-colors ${value === v ? "bg-ink text-ink-foreground" : "text-foreground"}`}
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
    style={{ width: `${size / 16}rem`, height: `${size / 16}rem`, background: filled ? `var(--${catId}-bg)` : "var(--comparison-border)" }}
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
    <Link to="/answer/$qid" params={{ qid }} search={{ step: first }} className="flex min-h-12 items-center gap-4 rounded-[20px] border border-border bg-card p-4">
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2 text-caption text-muted-foreground">
          <Dot catId={cat.id} />
          {cat.name} · 4단계 중 {f.filter(Boolean).length}단계
        </span>
        <span className="mt-1 block text-body font-medium">{q.core}</span>
      </span>
      <Chevron />
    </Link>
  );
}

export const rowCls = "flex min-h-16 w-full items-center gap-4 px-6 py-4 text-left";
