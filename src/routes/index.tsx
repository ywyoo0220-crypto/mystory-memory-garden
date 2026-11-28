import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import wordmark from "@/assets/mystory_wordmark.png.asset.json";
import { categoriesOf, type Kind } from "@/lib/data";
import { actions, hasContent, useStore, type Records, type StoryRecord } from "@/lib/store";
import { RecordCard } from "@/components/CategoryCard";
import { ViewToggle } from "@/components/ViewToggle";
import { DESK_QUERY, useMedia } from "@/lib/device";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "마이스토리 — 나의 기록" },
      { name: "description", content: "주제별, 시기별로 모아 보는 나의 인생 이야기." },
      { property: "og:title", content: "마이스토리 — 나의 기록" },
      { property: "og:description", content: "주제별, 시기별로 모아 보는 나의 인생 이야기." },
    ],
  }),
  component: Home,
});

/** 주제별: newest recorded first, topics interleaved. 시기별: period order, then question order — never by date. */
export const VIEW_NAME: Record<Kind, string> = { topic: "주제별", period: "시기별" };

export function homeCards(records: Records, kind: Kind) {
  const cards = categoriesOf(kind).flatMap((cat) =>
    cat.questions.filter((q) => hasContent(records[q.id])).map((q) => ({ cat, qid: q.id, rec: records[q.id] as StoryRecord })),
  );
  if (kind === "topic") cards.sort((a, b) => b.rec.updatedAt - a.rec.updatedAt);
  return cards;
}

/** Laptop: the deck splits into two stacks, dealt left then right so the order still reads row by row. */
export function deckColumns<T>(cards: T[], columns: number): T[][] {
  const cols: T[][] = Array.from({ length: Math.max(1, columns) }, () => []);
  cards.forEach((c, i) => cols[i % cols.length]!.push(c));
  return cols.filter((c) => c.length > 0);
}

/** One card per category, in the order its first record appears in homeCards. */
export function homeGroups(records: Records, kind: Kind) {
  const groups: { cat: ReturnType<typeof categoriesOf>[number]; items: { qid: string; rec: StoryRecord }[] }[] = [];
  for (const k of homeCards(records, kind)) {
    const g = groups.find((x) => x.cat.id === k.cat.id);
    if (g) g.items.push({ qid: k.qid, rec: k.rec });
    else groups.push({ cat: k.cat, items: [{ qid: k.qid, rec: k.rec }] });
  }
  return groups;
}

function Home() {
  const { records, view } = useStore();
  const [open, setOpen] = useState<string | null>(null);
  const [compactHeader, setCompactHeader] = useState(false);
  useEffect(() => {
    // Separate thresholds keep the header steady while its height changes.
    const onScroll = () => setCompactHeader((compact) => compact ? window.scrollY > 16 : window.scrollY > 64);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const cards = homeGroups(records, view);
  const other: Kind = view === "topic" ? "period" : "topic";
  const otherCount = homeCards(records, other).length;
  const hasExamples = Object.values(records).some((r) => r.example);
  const columns = deckColumns(cards, useMedia(DESK_QUERY) ? 2 : 1);

  return (
    <main className="ms-home px-6 pt-4">
      <header data-compact={compactHeader} className="ms-home-header header-solid -mx-6 flex flex-wrap items-center justify-between gap-x-4 gap-y-4 px-6">
        <h1 className="flex items-center">
          <img
            src={wordmark.url}
            alt="마이스토리"
            width={1979}
            height={483}
            className="ms-home-wordmark w-auto"
          />
        </h1>
        {/* No records yet: hide the 주제별/시기별 switch so the only choice on screen is where to start. */}
        {cards.length + otherCount > 0 && (
          <ViewToggle value={view} onChange={(v) => { actions.setView(v); setOpen(null); }} />
        )}
      </header>

      {cards.length === 0 && otherCount > 0 ? (
        /* This view is empty but the other one is not: say so, and offer the switch instead of "no records". */
        <div className="mx-auto mt-12 max-w-read rounded-[32px] bg-card px-6 py-12 text-center">
          <p className="font-serif text-title [text-wrap:balance] [word-break:keep-all]">{VIEW_NAME[view]} 기록은 아직 없어요.</p>
          <p className="mt-4 text-body text-muted-foreground [text-wrap:balance] [word-break:keep-all]">
            {view === "topic" ? "시기로 답한" : "주제로 답한"} 기록 {otherCount}개는 ‘{VIEW_NAME[other]}’에 있어요.
          </p>
          <button
            type="button"
            onClick={() => { actions.setView(other); setOpen(null); window.scrollTo({ top: 0 }); }}
            className="mt-8 inline-flex h-14 items-center rounded-full bg-ink px-8 text-body font-medium text-ink-foreground"
          >
            {VIEW_NAME[other]} 보기
          </button>
        </div>
      ) : cards.length === 0 ? (
        <div className="mx-auto mt-12 max-w-read rounded-[32px] bg-card px-6 py-12 text-center">
          <p className="font-serif text-title">아직 남긴 기록이 없어요.</p>
          <p className="mt-4 text-body text-muted-foreground [text-wrap:balance] [word-break:keep-all]">
            주제나 시기를 고르면 답할 질문이 나와요.
          </p>
          <Link
            to="/record"
            className="mt-8 inline-flex h-14 items-center rounded-full bg-ink px-8 text-body font-medium text-ink-foreground"
          >
            질문 고르기
          </Link>
        </div>
      ) : (
        /* Phone: the deck runs edge to edge. Wider screens: it lines up with the header, and on a laptop it becomes two stacks. */
        <div key={view} className="-mx-6 mt-4 flex items-start gap-6 tab:mx-0">
          {columns.map((col, c) => (
            <div key={c} className="ms-deck min-w-0 flex-1">
              {col.map((k, i) => (
                <RecordCard
                  key={k.cat.id}
                  items={k.items}
                  cat={k.cat}
                  open={open === k.cat.id}
                  onToggle={() => setOpen(open === k.cat.id ? null : k.cat.id)}
                  first={i === 0}
                  last={i === col.length - 1}
                  z={i + 1}
                />
              ))}
            </div>
          ))}
        </div>
      )}

      {otherCount > 0 && cards.length > 0 && (
        <button
          type="button"
          onClick={() => { actions.setView(other); setOpen(null); window.scrollTo({ top: 0 }); }}
          className="mx-auto mt-6 flex h-14 w-full max-w-read items-center justify-center rounded-full bg-ink text-body font-medium text-ink-foreground"
        >
          {VIEW_NAME[other]} 보기에 기록 {otherCount}개가 더 있어요
        </button>
      )}

      {hasExamples && (
        <p className="mt-6 text-center">
          <Link to="/my" className="inline-flex h-12 items-center rounded-full border px-4 text-caption text-muted-foreground">
            예시 기록 · MY에서 비울 수 있어요
          </Link>
        </p>
      )}
    </main>
  );
}
