import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { cardColors, getQuestion, type Category } from "@/lib/data";
import { actions, type StoryRecord } from "@/lib/store";
import { CategoryIcon } from "@/components/CategoryIcon";
import { catVars } from "@/lib/theme";
import { VoicePlayer } from "./VoicePlayer";
import { Button } from "./ui/button";

export function CategoryPill({ cat }: { cat: Category }) {
  const c = cardColors(cat);
  return (
    <span
      className="inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-[0.8125rem] font-medium"
      style={{ ...catVars(cat.id), background: c.pill, color: c.pillText }}
    >
      <span className="inline-flex" style={{ color: c.pillText }}><CategoryIcon id={cat.id} size={16} /></span>
      {cat.name}
    </span>
  );
}

function RecordBody({ qid, rec, fg, accent, showCore }: { qid: string; rec: StoryRecord; fg: string; accent: string; showCore: boolean }) {
  const q = getQuestion(qid);
  if (!q) return null;
  const steps = [q.core, ...q.followUps];
  return (
    <div className="space-y-6">
      {showCore && <h3 className="font-serif text-[1.5rem] leading-[1.4]">{q.core}</h3>}
      {steps.map((label, i) => {
        const a = rec.answers[i]?.trim();
        const voice = rec.voice?.step === i ? rec.voice : undefined;
        if (!a && !voice && !(i === 0 && rec.photo)) return null;
        return (
          <div key={i} className="space-y-3">
            {i > 0 && <p className="text-[1.0625rem] font-bold leading-[1.5]">{label}</p>}
            {a && <p className="whitespace-pre-line text-[1.0625rem] leading-[1.7]">{a}</p>}
            {voice && (
              <div className="space-y-2">
                <VoicePlayer text={voice.text} durationSec={voice.durationSec} fg={fg} accent={accent} />
                {voice.text && voice.text !== a && <p className="text-[1.0625rem] leading-[1.7]">{voice.text}</p>}
              </div>
            )}
            {i === 0 && rec.photo && (
              <img src={rec.photo} alt="첨부한 사진" loading="lazy" className="aspect-[16/10] w-full rounded-3xl border object-cover" style={{ borderColor: fg }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export function CategoryCard({
  cat,
  entries,
  open,
  onToggle,
  z,
  last,
}: {
  cat: Category;
  entries: [string, StoryRecord][];
  open: boolean;
  onToggle: () => void;
  z: number;
  last: boolean;
}) {
  const c = cardColors(cat);
  const [editing, setEditing] = useState(false);
  const navigate = useNavigate();
  const firstId = entries[0]?.[0] ?? "";
  const headId = entries.reduce((m, e) => (e[1].updatedAt > (m[1]?.updatedAt ?? -Infinity) ? e : m), entries[0] ?? ["", undefined as unknown as StoryRecord])[0];
  const first = getQuestion(headId);
  const sheets = Math.min(entries.length - 1, 2);
  const peek = sheets * 0.375; // rem: 6px per sheet

  const fix = () => {
    if (entries.length === 1) navigate({ to: "/answer/$qid", params: { qid: firstId } });
    else navigate({ to: "/cat/$catId", params: { catId: cat.id } });
  };
  const del = () => {
    if (window.confirm(`${cat.name}의 기록 ${entries.length}개를 지울까요?`)) actions.remove(entries.map((e) => e[0]));
  };

  return (
    <div
      className="group/card relative"
      style={{ zIndex: z, marginTop: `calc(${z === 1 ? "0rem" : "-3.25rem"} + ${peek}rem)` }}
      data-sheets={sheets}
    >
      {sheets >= 2 && (
        <div aria-hidden className="absolute inset-x-[1.25rem] -top-[0.75rem] h-16 rounded-t-[32px]" style={{ background: `color-mix(in srgb, ${c.bg} 32%, white)` }} />
      )}
      {sheets >= 1 && (
        <div aria-hidden className="absolute inset-x-[0.625rem] -top-[0.375rem] h-16 rounded-t-[32px]" style={{ background: `color-mix(in srgb, ${c.bg} 60%, white)` }} />
      )}
    <section
      className={`category-surface relative rounded-t-[32px] px-6 pt-6 ${last ? "rounded-b-[32px] pb-8" : "pb-[4.75rem]"}`}
      style={{ ...catVars(cat.id), background: c.bg, color: c.fg }}
    >
      <Button variant="palette"
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="block h-auto w-full whitespace-normal rounded-2xl p-0 text-left [&_svg]:size-auto"
      >
        <div className="flex items-center justify-between gap-2">
          <CategoryPill cat={cat} />
          <span
            className="inline-flex h-8 items-center gap-2 rounded-full px-3 text-[0.8125rem]"
            style={{ ...catVars(cat.id), background: "transparent", color: c.count, border: `1px solid ${c.count}` }}
          >
            기록 {entries.length}개
            <span className="h-3 w-px" style={{ background: `color-mix(in srgb, ${c.count} 30%, transparent)` }} />
            <span className="font-bold">{open ? "접기" : "펼치기"}</span>
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              className={`transition-transform duration-300 ${open ? "rotate-180" : ""}`}
              aria-hidden
            >
              <path d="m3 4.5 3 3 3-3" />
            </svg>
          </span>
        </div>
        <h2 className="mt-5 font-serif text-[1.5rem] leading-[1.4]">{first?.core}</h2>
      </Button>

      <div className="expand" data-open={open}>
        <div>
          <div className="space-y-10 pt-5">
            {entries.map(([qid, rec], i) => (
              <div key={qid} id={`rec-${qid}`} className="scroll-mt-[calc(5rem+env(safe-area-inset-top))]">
                <RecordBody qid={qid} rec={rec} fg={c.fg} accent={c.bg} showCore={!(i === 0 && qid === headId)} />
              </div>
            ))}
            <div className="grid grid-cols-2 gap-2 pb-1">
              {editing ? (
                <div className="flex h-14 overflow-hidden rounded-full border" style={{ borderColor: c.fg }}>
                  <Button variant="palette" type="button" onClick={fix} style={{ color: c.fg }} className="h-full flex-1 text-[0.9375rem] font-medium">
                    고치기
                  </Button>
                  <span className="w-px" style={{ background: `color-mix(in srgb, ${c.fg} 30%, transparent)` }} />
                  <Button variant="palette" type="button" onClick={del} style={{ color: c.fg }} className="h-full flex-1 text-[0.9375rem] font-medium">
                    지우기
                  </Button>
                </div>
              ) : (
                <Button variant="palette"
                  type="button"
                  onClick={() => setEditing(true)}
                  className="h-14 rounded-full border p-0 text-[0.9375rem] font-medium"
                  style={{ borderColor: c.fg, color: c.fg, background: "transparent" }}
                >
                  수정하기
                </Button>
              )}
              <Link
                to="/cat/$catId"
                params={{ catId: cat.id }}
                className="flex min-h-14 items-center justify-center rounded-full px-3 text-center text-[0.9375rem] font-bold leading-tight"
                style={{ background: c.btnBg, color: c.btnFg }}
              >
                {cat.name} 이야기 더 하기
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
    </div>
  );
}
