import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { cardColors, getQuestion, type Category } from "@/lib/data";
import { actions, type StoryRecord } from "@/lib/store";
import { Glyph } from "./Glyph";
import { catVars } from "@/lib/theme";
import { VoicePlayer } from "./VoicePlayer";

export function CategoryPill({ cat }: { cat: Category }) {
  const c = cardColors(cat);
  return (
    <span
      className="inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-[0.8125rem] font-medium"
      style={{ ...catVars(cat.id), background: c.pill, color: c.pillText }}
    >
      <Glyph cat={cat} size={14} color={c.pillText} />
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
              <img src={rec.photo} alt="첨부한 사진" loading="lazy" className="aspect-[16/10] w-full rounded-3xl object-cover" />
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
  const first = getQuestion(firstId);

  const fix = () => {
    if (entries.length === 1) navigate({ to: "/answer/$qid", params: { qid: firstId } });
    else navigate({ to: "/cat/$catId", params: { catId: cat.id } });
  };
  const del = () => {
    if (window.confirm(`${cat.name}의 기록 ${entries.length}개를 지울까요?`)) actions.remove(entries.map((e) => e[0]));
  };

  return (
    <section
      className={`category-surface relative -mt-8 rounded-t-[32px] px-6 pt-6 first:mt-0 ${last ? "rounded-b-[32px] pb-8" : "pb-14"}`}
      style={{ ...catVars(cat.id), background: c.bg, color: c.fg, zIndex: z }}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="block w-full rounded-2xl text-left"
      >
        <div className="flex items-center justify-between gap-2">
          <CategoryPill cat={cat} />
          <span
            className="inline-flex h-8 items-center gap-2 rounded-full px-3 text-[0.8125rem]"
            style={{ ...catVars(cat.id), background: c.pill, color: c.pillText }}
          >
            기록 {entries.length}개
            <span className="h-3 w-px" style={{ background: c.fg, opacity: 0.3 }} />
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
      </button>

      <div className="expand" data-open={open}>
        <div>
          <div className="space-y-10 pt-5">
            {entries.map(([qid, rec], i) => (
              <RecordBody key={qid} qid={qid} rec={rec} fg={c.fg} accent={c.btnFg} showCore={i > 0} />
            ))}
            <div className="grid grid-cols-2 gap-2 pb-1">
              {editing ? (
                <div className="flex h-14 overflow-hidden rounded-full border-[1.5px]" style={{ borderColor: c.fg }}>
                  <button type="button" onClick={fix} className="flex-1 text-[0.9375rem] font-medium">
                    고치기
                  </button>
                  <span className="w-px" style={{ background: c.fg, opacity: 0.3 }} />
                  <button type="button" onClick={del} className="flex-1 text-[0.9375rem] font-medium">
                    지우기
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setEditing(true)}
                  className="h-14 rounded-full border-[1.5px] text-[0.9375rem] font-medium"
                  style={{ borderColor: c.fg }}
                >
                  수정하기
                </button>
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
  );
}
