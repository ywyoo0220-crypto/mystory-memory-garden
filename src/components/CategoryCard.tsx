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
  const steps = [q.core, ...q.followUps];
  const photos = recordPhotos(rec);
  return (
    <div className="space-y-6">
      {showCore && <h3 className="font-serif text-title font-medium">{q.core}</h3>}
      {steps.map((label, i) => {
        const voice = rec.voices?.find((v) => v.step === i);
        const a = rec.answers[i]?.trim() || voice?.text?.trim();
        if (!a && !voice && !(i === 0 && photos.length)) return null;
        return (
          <div key={i} className={i > 0 ? "space-y-4 border-t border-current/15 pt-6" : "space-y-4"}>
            {i > 0 && (
              <p className="text-body font-medium">
                <span className="font-medium">Q.</span> {label}
              </p>
            )}
            {voice && (
              <div className="pb-4">
                <VoiceBar recordId={qid} voice={voice} text={a ?? ""} fg={fg} accent={accent} />
              </div>
            )}
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
        );
      })}
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
      style={{ zIndex: z, marginTop: first ? 0 : "-1.5rem" }}
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

        {list.map(({ qid, rec }, i) => {
          const q = getQuestion(qid)!;
          return (
            <div key={qid} id={`rec-${qid}`} className={i > 0 ? "mt-6 border-t border-current/20 pt-6" : "mt-6"}>
              <button type="button" onClick={onToggle} className="block w-full text-left">
                <h2 className="font-serif text-title font-medium">{q.core}</h2>
              </button>
              <div className="expand" data-open={open}>
                <div>
                  <div className="pt-6">
                    <RecordBody qid={qid} rec={rec} fg={c.fg} accent={c.bg} showCore={false} />
                    <button
                      type="button"
                      className="mt-6 flex min-h-12 w-full items-center justify-center rounded-full border px-4 py-2 text-center text-caption font-medium break-keep"
                      style={{ borderColor: c.fg, color: c.fg, background: "transparent" }}
                      onClick={() => navigate({ to: "/answer/$qid", params: { qid } })}
                    >
                      이 기록 수정하기
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        <div className="expand" data-open={open}>
          <div>
            <div className="pt-8 pb-1">
              <Link to="/cat/$catId" params={{ catId: cat.id }} className="flex min-h-14 items-center justify-center rounded-full px-4 py-2 text-center text-caption font-medium break-keep" style={{ background: c.btnBg, color: "#FFFFFF" }}>
                {cat.name} 이야기 더 하기
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
