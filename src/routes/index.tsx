import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import wordmark from "@/assets/mystory_wordmark.png.asset.json";
import { categoriesOf, type Kind } from "@/lib/data";
import { actions, hasContent, useStore, type Records, type StoryRecord } from "@/lib/store";
import { RecordCard } from "@/components/CategoryCard";
import { ViewToggle } from "@/components/ViewToggle";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "MyStory — 나의 기록" },
      { name: "description", content: "주제별, 시간순으로 모아 보는 나의 인생 이야기." },
      { property: "og:title", content: "MyStory — 나의 기록" },
      { property: "og:description", content: "주제별, 시간순으로 모아 보는 나의 인생 이야기." },
    ],
  }),
  component: Home,
});

/** 주제별: newest recorded first, topics interleaved. 시간순: period order, then question order — never by date. */
export function homeCards(records: Records, kind: Kind) {
  const cards = categoriesOf(kind).flatMap((cat) =>
    cat.questions.filter((q) => hasContent(records[q.id])).map((q) => ({ cat, qid: q.id, rec: records[q.id] as StoryRecord })),
  );
  if (kind === "topic") cards.sort((a, b) => b.rec.updatedAt - a.rec.updatedAt);
  return cards;
}

function Home() {
  const { records, view } = useStore();
  const [open, setOpen] = useState<string | null>(null);
  const cards = homeCards(records, view);
  const other: Kind = view === "topic" ? "period" : "topic";
  const otherCount = homeCards(records, other).length;
  const hasExamples = Object.values(records).some((r) => r.example);

  return (
    <main className="px-3 pt-4">
      <header className="flex items-center justify-between gap-6 px-3 py-3 [.large_&]:px-0">
        <h1 className="flex items-center">
          <img
            src={wordmark.url}
            alt="MyStory"
            width={1979}
            height={483}
            className="h-[1.875rem] w-auto"
          />
        </h1>
        {/* No records yet: hide the 주제별/시간순 switch so the only choice on screen is where to start. */}
        {cards.length + otherCount > 0 && (
          <ViewToggle value={view} onChange={(v) => { actions.setView(v); setOpen(null); }} />
        )}
      </header>

      {cards.length === 0 ? (
        <div className="mx-3 mt-10 rounded-[32px] bg-card px-6 py-12 text-center">
          <p className="font-serif text-[1.5rem] leading-[1.4]">아직 남긴 기록이 없어요.</p>
          <p className="mt-3 text-[1.0625rem] leading-[1.7] text-muted-foreground [text-wrap:balance] [word-break:keep-all]">
            주제나 시기를 고르면 답할 질문이 나와요.
          </p>
          <Link
            to="/record"
            className="mt-8 inline-flex h-14 items-center rounded-full bg-ink px-8 text-[1rem] font-semibold text-ink-foreground"
          >
            질문 고르기
          </Link>
        </div>
      ) : (
        <div className="-mx-3 mt-4">
          {cards.map((k, i) => (
            <RecordCard
              key={k.qid}
              qid={k.qid}
              rec={k.rec}
              cat={k.cat}
              open={open === k.qid}
              onToggle={() => setOpen(open === k.qid ? null : k.qid)}
              first={i === 0}
              last={i === cards.length - 1}
              z={i + 1}
            />
          ))}
        </div>
      )}

      {otherCount > 0 && (
        <button
          type="button"
          onClick={() => { actions.setView(other); setOpen(null); window.scrollTo({ top: 0 }); }}
          className="mx-3 mt-6 flex h-14 w-[calc(100%-1.5rem)] items-center justify-center rounded-full bg-ink text-[1rem] font-semibold text-ink-foreground"
        >
          {other === "period" ? "시간순" : "주제별"} 보기에 기록 {otherCount}개가 더 있어요
        </button>
      )}

      {hasExamples && (
        <p className="mt-6 text-center">
          <Link to="/my" className="inline-flex h-10 items-center rounded-full border px-4 text-[0.8125rem] text-muted-foreground">
            예시 기록 · MY에서 비울 수 있어요
          </Link>
        </p>
      )}
    </main>
  );
}
