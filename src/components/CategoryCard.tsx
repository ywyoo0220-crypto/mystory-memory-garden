import { useEffect, useRef } from "react";
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
  // 카드 라벨 알약 바탕은 항상 어두우므로 아이콘과 이름을 흰색으로 둔다.
  const label = cat.kind === "period" ? c.pillText : "#FFFFFF";
  return (
    <span
      className="inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-[0.8125rem] font-medium"
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
  const steps = [q.core, ...q.followUps];
  const photos = recordPhotos(rec);
  return (
    <div className="space-y-6">
      {showCore && <h3 className="font-serif text-[1.5rem] font-medium leading-[1.4]">{q.core}</h3>}
      {steps.map((label, i) => {
        const voice = rec.voices?.find((v) => v.step === i);
        const a = rec.answers[i]?.trim() || voice?.text?.trim();
        if (!a && !voice && !(i === 0 && photos.length)) return null;
        return (
          <div key={i} className="space-y-3">
            {i > 0 && <p className="text-[1.0625rem] font-bold leading-[1.5]">{label}</p>}
            {voice && (
              <div className="pb-3">
                <VoiceBar recordId={qid} voice={voice} text={a ?? ""} fg={fg} accent={accent} />
              </div>
            )}
            {voice && a && <p className="text-[0.8125rem] font-medium">음성 기록을 글로 옮긴 내용</p>}
            {a && <p className="whitespace-pre-line text-[1.0625rem] leading-[1.7]">{a}</p>}
            {i === 0 && photos.map((p) => <CardPhoto key={p} src={p} fg={fg} />)}
          </div>
        );
      })}
    </div>
  );
}

const dateLabel = (t: number) => {
  const d = new Date(t);
  return `${d.getMonth() + 1}월 ${d.getDate()}일`;
};

/** One Home card = one answered core question (one record). */
export function RecordCard({
  qid,
  rec,
  cat,
  open,
  onToggle,
  first,
  last,
  z,
}: {
  qid: string;
  rec: StoryRecord;
  cat: Category;
  open: boolean;
  onToggle: () => void;
  first: boolean;
  last: boolean;
  z: number;
}) {
  const c = cardColors(cat);
  const q = getQuestion(qid);
  const navigate = useNavigate();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }
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

  if (!q) return null;

  return (
    <div
      ref={ref}
      id={`rec-${qid}`}
      className="relative scroll-mt-[calc(1rem+env(safe-area-inset-top))]"
      style={{ zIndex: z, marginTop: first ? 0 : "-2rem" }}
    >
      <section
        className={`category-surface relative rounded-t-[32px] px-6 pt-6 ${last ? "rounded-b-[32px] pb-8" : "pb-[3.75rem]"}`}
        style={{
          ...catVars(cat.id),
          background: c.bg,
          color: c.fg,
        }}
      >
        <Button
          variant="palette"
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          className="block h-auto w-full whitespace-normal rounded-2xl p-0 text-left [&_svg]:size-auto"
        >
          <div className="flex items-center justify-between gap-2">
            <CategoryPill cat={cat} />
            <span
              className="inline-flex h-8 shrink-0 items-center gap-2 rounded-full px-3 text-[0.8125rem]"
              style={{ background: "transparent", color: c.count, border: `1px solid ${c.count}` }}
            >
              {!open && dateLabel(rec.updatedAt)}
              {!open && <span className="h-3 w-px" style={{ background: c.count }} />}
              <span className="font-bold">{open ? "접기" : "펼치기"}</span>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.6" className={`transition-transform duration-300 ${open ? "rotate-180" : ""}`} aria-hidden>
                <path d="m3 4.5 3 3 3-3" />
              </svg>
            </span>
          </div>
          <h2 className="mt-5 font-serif text-[1.5rem] font-medium leading-[1.4]">{q.core}</h2>
        </Button>

        <div className="expand" data-open={open}>
          <div>
            <div className="pt-5">
              <RecordBody qid={qid} rec={rec} fg={c.fg} accent={c.bg} showCore={false} />
              <div className="mt-8 grid grid-cols-2 gap-2 pb-1">
                <button type="button" className="h-14 rounded-full border text-[0.9375rem] font-medium" style={{ borderColor: c.fg, color: c.fg, background: "transparent" }} onClick={() => navigate({ to: "/answer/$qid", params: { qid } })}>
                  수정하기
                </button>
                <Link to="/cat/$catId" params={{ catId: cat.id }} className="flex min-h-14 flex-col items-center justify-center rounded-full px-3 py-1.5 text-center leading-tight break-keep" style={{ background: c.btnBg, color: "#FFFFFF" }}>
                  <span className="text-[0.9375rem] font-bold">{cat.name}</span>
                  <span className="text-[0.9375rem] font-medium">이야기 더 하기</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
