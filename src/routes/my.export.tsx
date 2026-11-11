import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import wordmark from "@/assets/mystory_wordmark.png.asset.json";
import { categoriesOf, getQuestion, type Kind } from "@/lib/data";
import { hasContent, recordPhotos, useStore, type StoryRecord } from "@/lib/store";
import { periodYears, usePrefs } from "@/lib/prefs";
import { useMediaUrl } from "@/lib/media";
import { CategoryIcon } from "@/components/CategoryIcon";
import { Segmented, SubHeader } from "@/components/my/ui";

export const Route = createFileRoute("/my/export")({
  head: () => ({
    meta: [
      { title: "기록 책으로 묶기 — myStory" },
      { name: "description", content: "기록을 책 모양으로 묶어 PDF로 저장해요." },
      { property: "og:title", content: "기록 책으로 묶기 — myStory" },
      { property: "og:description", content: "기록을 책 모양으로 묶어 PDF로 저장해요." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ExportPage,
});

function ExportPage() {
  const { records } = useStore();
  const { profile } = usePrefs();
  const [order, setOrder] = useState<Kind>("topic");
  const chapters = categoriesOf(order)
    .map((c) => ({ c, qs: c.questions.filter((q) => hasContent(records[q.id])) }))
    .filter((x) => x.qs.length);
  const n = chapters.reduce((s, x) => s + x.qs.length, 0);
  return (
    <main className="pb-6">
      <SubHeader title="기록 책으로 묶기" sub="장 순서를 고르고 PDF로 저장해요." />
      <div className="no-print space-y-3 px-4 pb-6">
        <Segmented label="장 순서" value={order} onChange={setOrder} options={[["topic", "주제별"], ["period", "시간순"]]} />
        <button
          type="button"
          onClick={() => window.print()}
          disabled={!n}
          className="flex h-14 w-full items-center justify-center rounded-full bg-ink text-[1.0625rem] font-semibold text-ink-foreground disabled:opacity-40"
        >
          PDF로 저장
        </button>
      </div>
      <article className="mx-4 overflow-hidden rounded-[20px] border border-border bg-card" aria-label="책 미리보기">
        <header className="print-chapter flex min-h-[18rem] flex-col items-center justify-center gap-4 px-6 py-12 text-center">
          <img src={wordmark.url} alt="myStory" className="h-[1.75rem] w-auto" />
          <h2 className="text-[1.75rem] font-bold">{profile.name || "나"}의 이야기</h2>
          <p className="text-[0.9375rem] text-muted-foreground">
            {order === "topic" ? "주제별" : "시간순"} · {n}개의 기록 · {new Date().getFullYear()}
          </p>
        </header>
        {chapters.map(({ c, qs }) => {
          const yrs = c.kind === "period" ? periodYears(profile.birth, c.index) : "";
          return (
            <section key={c.id} className="print-chapter">
              <div className="flex items-center gap-3 px-6 py-5" style={{ background: c.color.background, color: c.color.text }}>
                <CategoryIcon id={c.id} size={22} />
                <h3 className="text-[1.25rem] font-bold">{c.name}</h3>
                {yrs && <span className="ml-auto text-[0.875rem] font-medium">{yrs}</span>}
              </div>
              <div className="space-y-8 px-6 py-6">
                {qs.map((q) => <BookRecord key={q.id} qid={q.id} rec={records[q.id] as StoryRecord} />)}
              </div>
            </section>
          );
        })}
      </article>
    </main>
  );
}

function BookRecord({ qid, rec }: { qid: string; rec: StoryRecord }) {
  const q = getQuestion(qid);
  if (!q) return null;
  const photos = recordPhotos(rec);
  return (
    <div className="space-y-3">
      <h4 className="text-[1.125rem] font-bold leading-[1.5]">{q.core}</h4>
      {[q.core, ...q.followUps].map((label, i) => {
        const voice = rec.voices?.find((v) => v.step === i);
        const text = rec.answers[i]?.trim() || voice?.text?.trim();
        const ph = i === 0 ? photos : [];
        if (!text && !ph.length) return null;
        return (
          <div key={i} className="space-y-2">
            {i > 0 && <p className="pt-2 text-[0.9375rem] font-bold">{label}</p>}
            {text && (
              <p className="whitespace-pre-line text-[1rem] leading-[1.7]">
                {voice && (
                  <span className="mr-2 inline-flex items-center gap-1 align-[-0.1em] text-[0.8125rem] font-medium text-muted-foreground">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
                      <rect x="9" y="3" width="6" height="11" rx="3" />
                      <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
                    </svg>
                    음성
                  </span>
                )}
                {text}
              </p>
            )}
            {ph.map((p) => <BookPhoto key={p} src={p} />)}
          </div>
        );
      })}
    </div>
  );
}
function BookPhoto({ src }: { src: string }) {
  const url = useMediaUrl(src);
  return url ? <img src={url} alt="기록 사진" className="aspect-[16/10] w-full rounded-2xl object-cover" /> : null;
}
