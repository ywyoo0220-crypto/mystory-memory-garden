import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import wordmark from "@/assets/mystory_wordmark.png.asset.json";
import { categoriesOf, type Kind } from "@/lib/data";
import { actions, hasContent, useStore, type Records, type StoryRecord } from "@/lib/store";
import { CategoryCard } from "@/components/CategoryCard";
import { ViewToggle } from "@/components/ViewToggle";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "myStory — 나의 기록" },
      { name: "description", content: "주제별, 시간순으로 모아 보는 나의 인생 이야기." },
      { property: "og:title", content: "myStory — 나의 기록" },
      { property: "og:description", content: "주제별, 시간순으로 모아 보는 나의 인생 이야기." },
    ],
  }),
  component: Home,
});

function group(records: Records, kind: Kind) {
  return categoriesOf(kind)
    .map((cat) => {
      const entries = cat.questions
        .filter((q) => hasContent(records[q.id]))
        .map((q) => [q.id, records[q.id]] as [string, StoryRecord]);
      return { cat, entries };
    })
    .filter((g) => g.entries.length > 0);
}

function Home() {
  const { records, view } = useStore();
  const [open, setOpen] = useState<string | null>(null);
  const groups = group(records, view);
  const other: Kind = view === "topic" ? "period" : "topic";
  const otherCount = group(records, other).reduce((n, g) => n + g.entries.length, 0);
  const hasExamples = Object.values(records).some((r) => r.example);

  return (
    <main className="px-3 pt-4">
      <header className="flex items-center justify-between px-3 py-3">
        <h1 className="flex items-center">
          <img
            src={wordmark.url}
            alt="myStory"
            width={1979}
            height={483}
            className="h-[1.875rem] w-auto"
          />
        </h1>
        <ViewToggle value={view} onChange={(v) => { actions.setView(v); setOpen(null); }} />
      </header>

      {groups.length === 0 ? (
        <div className="mx-3 mt-10 rounded-[32px] bg-card px-6 py-12 text-center">
          <p className="font-serif text-[1.5rem] leading-[1.4]">
            {view === "topic" ? "아직 주제별 기록이 없어요." : "아직 시간순 기록이 없어요."}
          </p>
          <p className="mt-3 text-[1.0625rem] leading-[1.7] text-muted-foreground">
            질문 하나에 답하는 것부터 시작하세요.
          </p>
          <Link
            to="/kind/$kind"
            params={{ kind: view }}
            className="mt-8 inline-flex h-14 items-center rounded-full bg-ink px-8 text-[1rem] font-semibold text-ink-foreground"
          >
            기록 시작하기
          </Link>
        </div>
      ) : (
        <div className="mt-4">
          {groups.map((g, i) => (
            <CategoryCard
              key={g.cat.id}
              cat={g.cat}
              entries={g.entries}
              open={open === g.cat.id}
              onToggle={() => setOpen(open === g.cat.id ? null : g.cat.id)}
              z={i + 1}
              last={i === groups.length - 1}
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
