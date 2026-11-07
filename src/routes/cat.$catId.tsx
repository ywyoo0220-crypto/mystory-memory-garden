import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { getCategory } from "@/lib/data";
import { hasContent, useStore } from "@/lib/store";
import { Glyph } from "@/components/Glyph";
import { BackBar } from "@/components/BackBar";

export const Route = createFileRoute("/cat/$catId")({
  beforeLoad: ({ params }) => {
    const c = getCategory(params.catId);
    if (!c || c.questions.length === 0) throw notFound();
  },
  head: ({ params }) => {
    const t = `${getCategory(params.catId)?.name ?? "질문"} — myStory`;
    return {
      meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
        { title: t },
        { name: "description", content: "답하고 싶은 질문을 고르세요." },
        { property: "og:title", content: t },
        { property: "og:description", content: "답하고 싶은 질문을 고르세요." },
      ],
    };
  },
  component: CatQuestions,
});

function CatQuestions() {
  const cat = getCategory(Route.useParams().catId)!;
  const { records } = useStore();
  return (
    <main>
      <BackBar title={cat.kind === "topic" ? "주제" : "시기"} />
      <div className="px-6 pb-6 pt-2">
        <div className="flex items-center gap-4">
          <span className="flex size-14 items-center justify-center rounded-full" style={{ background: cat.color.background }}>
            <Glyph cat={cat} size={26} color={cat.color.text} />
          </span>
          <h1 className="font-serif text-[1.75rem]">{cat.name}</h1>
        </div>
        <p className="mt-4 text-[1.0625rem] leading-[1.7] text-muted-foreground">
          질문 하나를 골라 시작하세요. 모든 질문에 답하지 않아도 됩니다.
        </p>
      </div>
      <ul className="space-y-2 px-3">
        {cat.questions.map((q) => {
          const done = hasContent(records[q.id]);
          return (
            <li key={q.id}>
              <Link
                to="/answer/$qid"
                params={{ qid: q.id }}
                className="flex gap-3 rounded-3xl p-5"
                style={done ? { background: cat.color.tint } : { background: "var(--card)" }}
              >
                <span
                  className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border-[1.5px]"
                  style={done ? { background: cat.color.text, borderColor: cat.color.text } : { borderColor: "var(--border)" }}
                  aria-hidden
                >
                  {done && (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke={cat.color.tint} strokeWidth="2">
                      <path d="m2.5 6 2.5 2.5 4.5-5" />
                    </svg>
                  )}
                </span>
                <span className="min-w-0">
                  <span className="block font-serif text-[1.1875rem] leading-[1.5]">{q.core}</span>
                  <span className="mt-1.5 block text-[0.8125rem] text-muted-foreground">
                    {done ? "기록함 · 눌러서 이어쓰기" : `질문 4개 · 천천히 답해요`}
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
