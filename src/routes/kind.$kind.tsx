import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { categoriesOf, type Kind } from "@/lib/data";
import { hasContent, useStore } from "@/lib/store";
import { Glyph } from "@/components/Glyph";
import { BackBar } from "@/components/BackBar";

export const Route = createFileRoute("/kind/$kind")({
  beforeLoad: ({ params }) => {
    if (params.kind !== "topic" && params.kind !== "period") throw notFound();
  },
  head: ({ params }) => {
    const t = params.kind === "period" ? "시기 고르기 — myStory" : "주제 고르기 — myStory";
    return {
      meta: [
        { title: t },
        { name: "description", content: "기록할 범주를 고르세요." },
        { property: "og:title", content: t },
        { property: "og:description", content: "기록할 범주를 고르세요." },
      ],
    };
  },
  component: KindList,
});

function KindList() {
  const kind = Route.useParams().kind as Kind;
  const { records } = useStore();
  const cats = categoriesOf(kind);
  return (
    <main>
      <BackBar title={kind === "topic" ? "주제 고르기" : "시기 고르기"} />
      <div className="px-6 pb-6 pt-4">
        <h1 className="font-serif text-[1.75rem] leading-[1.4]">{kind === "topic" ? "주제를 고르세요." : "시기를 고르세요."}</h1>
      </div>
      <ul className="space-y-1 px-3">
        {cats.map((c) => {
          const total = c.questions.length;
          const done = c.questions.filter((q) => hasContent(records[q.id])).length;
          const pending = total === 0;
          const inner = (
            <>
              <span className="flex size-12 shrink-0 items-center justify-center rounded-full" style={{ background: c.color.background }}>
                <Glyph cat={c} size={22} color={c.color.text} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[1.0625rem] font-semibold">{c.name}</span>
                <span className="block text-[0.875rem] text-muted-foreground">
                  {pending ? "질문 준비 중" : done ? `${total}개 중 ${done}개 기록함` : `질문 ${total}개`}
                </span>
              </span>
              {!pending && (
                <span className="h-1 w-14 overflow-hidden rounded-full bg-muted" aria-hidden>
                  <span className="block h-full rounded-full bg-ink" style={{ width: `${(done / total) * 100}%` }} />
                </span>
              )}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="text-muted-foreground" aria-hidden>
                <path d="m9 5 7 7-7 7" />
              </svg>
            </>
          );
          const cls = "flex min-h-[4.5rem] items-center gap-4 rounded-3xl px-3 py-3";
          return (
            <li key={c.id}>
              {pending ? (
                <div className={`${cls} opacity-50`} aria-disabled="true">{inner}</div>
              ) : (
                <Link
                  to="/cat/$catId"
                  params={{ catId: c.id }}
                  className={`${cls} transition-colors hover:bg-card`}
                  style={done ? { background: c.color.tint } : undefined}
                >
                  {inner}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </main>
  );
}
