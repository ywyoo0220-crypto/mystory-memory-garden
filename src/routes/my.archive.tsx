import { createFileRoute, Link } from "@tanstack/react-router";
import { categoryOfQuestion, getQuestion, periods, topics, type Category } from "@/lib/data";
import { hasContent, isIncomplete, useStore, type Records, type StoryRecord } from "@/lib/store";
import { periodYears, usePrefs } from "@/lib/prefs";
import { dateLabel } from "@/lib/utils";
import { Chevron, ContinueCard, Dot, SubHeader } from "@/components/my/ui";

export const Route = createFileRoute("/my/archive")({
  head: () => ({
    meta: [
      { title: "나의 아카이브 — MyStory" },
      { name: "description", content: "주제와 시기별로 얼마나 기록했는지 봐요." },
      { property: "og:title", content: "나의 아카이브 — MyStory" },
      { property: "og:description", content: "주제와 시기별로 얼마나 기록했는지 봐요." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Archive,
});

function Archive() {
  const { records } = useStore();
  const { profile } = usePrefs();
  const incomplete = Object.entries(records).filter(([, r]) => isIncomplete(r)).sort((a, b) => b[1].updatedAt - a[1].updatedAt);
  const done = Object.entries(records)
    .filter(([, r]) => hasContent(r) && !isIncomplete(r))
    .sort((a, b) => b[1].updatedAt - a[1].updatedAt)
    .slice(0, 5);
  return (
    <main className="pb-6">
      <SubHeader title="나의 아카이브" />
      <div className="space-y-8 px-6">
        <Grid title="주제별" cats={topics} records={records} />
        <Grid title="시간순" cats={periods} records={records} birth={profile.birth} />
        {incomplete.length > 0 && (
          <section>
            <h2 className="px-2 pb-4 text-body font-medium">이어서 쓰기 · {incomplete.length}개</h2>
            <div className="space-y-2">
              {incomplete.map(([q, r]) => <ContinueCard key={q} qid={q} rec={r} />)}
            </div>
          </section>
        )}
        {done.length > 0 && (
          <section>
            <h2 className="px-2 pb-4 text-body font-medium">최근 기록</h2>
            <ul className="space-y-2">
              {done.map(([q, r]) => <RecentRow key={q} qid={q} rec={r} />)}
            </ul>
          </section>
        )}
      </div>
    </main>
  );
}

function Grid({ title, cats, records, birth = "" }: { title: string; cats: Category[]; records: Records; birth?: string }) {
  return (
    <section>
      <h2 className="px-2 pb-4 text-body font-medium">{title}</h2>
      <ul className="grid grid-cols-2 gap-2">
        {cats.map((c) => {
          const n = c.questions.length;
          const f = c.questions.filter((q) => hasContent(records[q.id])).length;
          const yrs = c.kind === "period" ? periodYears(birth, c.index) : "";
          return (
            <li key={c.id} className="rounded-[20px] border border-border bg-card p-4">
              <div className="flex items-center gap-2">
                <Dot catId={c.id} />
                <span className="min-w-0 flex-1 text-caption font-medium">{c.name}</span>
                <span className="text-caption tabular-nums text-muted-foreground">{n ? `${f}/${n}` : "준비 중"}</span>
              </div>
              {yrs && <p className="mt-1 text-caption text-muted-foreground">{yrs}</p>}
              <div className="mt-4 h-1 overflow-hidden rounded-full bg-muted" aria-hidden>
                <div className="h-full rounded-full" style={{ width: n ? `${(f / n) * 100}%` : 0, background: `var(--${c.id}-list-accent)` }} />
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/** A finished record: when it was written, and what it answers. */
function RecentRow({ qid, rec }: { qid: string; rec: StoryRecord }) {
  const cat = categoryOfQuestion(qid);
  const q = getQuestion(qid);
  if (!cat || !q) return null;
  return (
    <li>
      <Link to="/answer/$qid" params={{ qid }} className="flex min-h-12 items-center gap-4 rounded-[20px] border border-border bg-card p-4">
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2 text-caption text-muted-foreground">
            <Dot catId={cat.id} />
            {cat.name} · {dateLabel(rec.updatedAt)}에 기록
          </span>
          <span className="mt-1 block text-body font-medium">{q.core}</span>
        </span>
        <Chevron />
      </Link>
    </li>
  );
}
