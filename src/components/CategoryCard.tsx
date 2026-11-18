import { Fragment, useEffect, useRef, type CSSProperties } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { cardColors, getQuestion, type Category } from "@/lib/data";
import { recordPhotos, type StoryRecord } from "@/lib/store";
import { useMediaUrl } from "@/lib/media";
import { CategoryIcon } from "@/components/CategoryIcon";
import { catVars } from "@/lib/theme";
import { VoiceBar } from "./VoicePlayer";

function CardPhoto({ src, fg }: { src: string; fg: string }) {
  const url = useMediaUrl(src);
  if (!url) return <div className="aspect-[16/10] w-full rounded-3xl border" style={{ borderColor: fg }} aria-hidden />;
  return <img src={url} alt="첨부한 사진" loading="lazy" className="aspect-[16/10] w-full rounded-3xl border object-cover" style={{ borderColor: fg }} />;
}
import { Button } from "./ui/button";

export function CategoryPill({ cat }: { cat: Category }) {
  const c = cardColors(cat);
  // 알약 바탕은 모든 카테고리에서 검은 채움이므로 아이콘과 이름을 흰색으로 둔다.
  const label = "#FFFFFF";
  return (
    <span
      className="inline-flex h-8 shrink-0 items-center gap-2 whitespace-nowrap rounded-full px-4 text-caption font-medium"
      style={{ ...catVars(cat.id), background: c.pill, color: label }}
    >
      <span className="inline-flex" style={{ color: label }}><CategoryIcon id={cat.id} size={16} /></span>
      {cat.name}
    </span>
  );
}

function RecordBody({ qid, rec, fg, accent, showCore }: { qid: string; rec: StoryRecord; fg: string; accent: string; showCore: boolean }) {
  const q = getQuestion(qid);
  if (!q) return null;
  const photos = recordPhotos(rec);
  const step = (label: string, i: number) => {
    const voice = rec.voices?.find((v) => v.step === i);
    const a = rec.answers[i]?.trim() || voice?.text?.trim();
    if (!a && !voice && !(i === 0 && photos.length)) return null;
    return (
      <div key={i} className="ms-in" style={{ "--i": i } as CSSProperties}>
        {/* Follow-up question: one size below the answer and tight to it, so the answer (the person's own words) leads. */}
        {i > 0 && <p className="mb-2 text-caption font-medium">{label}</p>}
        <div className="space-y-4">
          {voice && <VoiceBar recordId={qid} voice={voice} text={a ?? ""} fg={fg} accent={accent} />}
          {voice && a ? (
            <div className="rounded-2xl bg-current/10 p-4">
              <p className="text-caption font-medium opacity-80">[음성] 말로 남긴 내용</p>
              <p className="mt-2 whitespace-pre-line text-body">{a}</p>
            </div>
          ) : (
            a && <p className="whitespace-pre-line text-body">{a}</p>
          )}
          {i === 0 && photos.map((p) => <CardPhoto key={p} src={p} fg={fg} />)}
        </div>
      </div>
    );
  };
  const follow = q.followUps.map((label, k) => step(label, k + 1)).filter(Boolean);
  return (
    <div className="space-y-6">
      {showCore && <h3 className="font-serif text-title font-medium">{q.core}</h3>}
      {step(q.core, 0)}
      {/* The follow-ups branch from the core question: one line on the left holds them together
          (the same branching as the question-structure poster). */}
      {follow.length > 0 && <div className="space-y-6 border-l-2 border-current/35 pl-4">{follow}</div>}
    </div>
  );
}

/** One Home card = one category; every answered core question in it is listed, so the card grows with the records. */
export function RecordCard({
  items,
  cat,
  open,
  onToggle,
  first,
  last,
  z,
}: {
  items: { qid: string; rec: StoryRecord }[];
  cat: Category;
  open: boolean;
  onToggle: () => void;
  first: boolean;
  last: boolean;
  z: number;
}) {
  const c = cardColors(cat);
  const navigate = useNavigate();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => {
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      if (r.top < 80 || r.top > window.innerHeight * 0.6) {
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        el.scrollIntoView({ block: "start", behavior: reduce ? "auto" : "smooth" });
      }
    }, 80);
    return () => window.clearTimeout(t);
  }, [open]);

  const list = items.filter((k) => getQuestion(k.qid));
  if (!list.length) return null;

  return (
    <div
      ref={ref}
      id={`cat-${cat.id}`}
      className="relative scroll-mt-[calc(1rem+env(safe-area-inset-top))]"
      style={{ zIndex: z, marginTop: first ? 0 : "-1.5rem", "--i": Math.min(z - 1, 8) } as CSSProperties}
    >
      <section
        className={`category-surface relative rounded-t-[32px] px-6 pt-6 ${last ? "rounded-b-[32px] pb-8" : "pb-[3.75rem]"}`}
        style={{ ...catVars(cat.id), background: c.bg, color: c.fg }}
      >
        <Button
          variant="palette"
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          className="block h-auto w-full whitespace-normal rounded-2xl p-0 text-left [&_svg]:size-auto"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CategoryPill cat={cat} />
            <span
              className="inline-flex h-8 shrink-0 items-center gap-2 whitespace-nowrap rounded-full px-4 text-caption"
              style={{ background: "transparent", color: c.count, border: `1px solid ${c.count}` }}
            >
              <span className="font-medium">{open ? "접기" : "펼치기"}</span>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.6" className={`transition-transform duration-300 ${open ? "rotate-180" : ""}`} aria-hidden>
                <path d="m3 4.5 3 3 3-3" />
              </svg>
            </span>
          </div>
        </Button>

        {/* 기록이 2개 이상일 때만, 두 기록 사이 여백의 정중앙에 28px 짧은 먹색 선을 놓는다.
            선 위아래 각 40px(총 80px)로 여유를 둔다. */}
        <div className="mt-6 flex flex-col gap-10">
          {list.map(({ qid, rec }, i) => {
            const q = getQuestion(qid)!;
            return (
              <Fragment key={qid}>
                {i > 0 && <span aria-hidden="true" className="block h-px w-7 shrink-0" style={{ background: c.fg }} />}
                <div id={`rec-${qid}`}>
                  <button type="button" onClick={onToggle} className="block w-full text-left">
                    <h2 className="font-serif text-title font-medium">{q.core}</h2>
                  </button>
                  <div className="expand" data-open={open}>
                    <div>
                      <div className="pt-6" style={{ "--j": Math.min(i, 3) } as CSSProperties}>
                        <RecordBody qid={qid} rec={rec} fg={c.fg} accent={c.bg} showCore={false} />
                      </div>
                    </div>
                  </div>
                </div>
              </Fragment>
            );
          })}
        </div>

        <div className="expand" data-open={open}>
          <div>
            <div className="ms-in pt-8 pb-1" style={{ "--i": 2 } as CSSProperties}>
              {/* 질문 수와 상관없이 하단은 한 줄로 통일: 질문이 여럿이면 수정은 질문 목록에서 고른다. */}
              <div className="grid grid-cols-[3fr_7fr] gap-2">
                <button
                  type="button"
                  className="flex min-h-14 items-center justify-center rounded-full border px-2 py-2 text-center text-caption font-medium break-keep"
                  style={{ borderColor: c.fg, color: c.fg, background: "transparent" }}
                  onClick={() =>
                    list.length === 1
                      ? navigate({ to: "/answer/$qid", params: { qid: list[0]!.qid } })
                      : navigate({ to: "/cat/$catId", params: { catId: cat.id }, search: { mode: "edit" } })
                  }
                >
                  수정하기
                </button>
                <Link to="/cat/$catId" params={{ catId: cat.id }} className="flex min-h-14 items-center justify-center rounded-full px-4 py-2 text-center text-caption font-medium break-keep" style={{ background: c.btnBg, color: "#FFFFFF" }}>
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
