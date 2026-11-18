import { catVars } from "@/lib/theme";
import { createFileRoute, Link, notFound, useNavigate, useRouter } from "@tanstack/react-router";
import { getCategory } from "@/lib/data";
import { filledSteps, hasContent, useStore } from "@/lib/store";
import { CategoryIcon } from "@/components/CategoryIcon";
import { BackBar } from "@/components/BackBar";

export function goBackFromQuestions(
  history: { canGoBack: () => boolean; back: () => void },
  fallback: () => void,
) {
  if (history.canGoBack()) history.back();
  else fallback();
}

export const Route = createFileRoute("/cat/$catId")({
  beforeLoad: ({ params }) => {
    const c = getCategory(params.catId);
    if (!c || c.questions.length === 0) throw notFound();
  },
  head: ({ params }) => {
    const t = `${getCategory(params.catId)?.name ?? "질문"} — 마이스토리`;
    return {
      meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
        { title: t },
        { name: "description", content: "답하고 싶은 질문을 골라요." },
        { property: "og:title", content: t },
        { property: "og:description", content: "답하고 싶은 질문을 골라요." },
      ],
    };
  },
  validateSearch: (s: Record<string, unknown>): { mode?: "edit" } =>
    s["mode"] === "edit" ? { mode: "edit" } : {},
  component: CatQuestions,
});

function CatQuestions() {
  const cat = getCategory(Route.useParams().catId);
  const { records } = useStore();
  const edit = Route.useSearch().mode === "edit";
  const navigate = useNavigate();
  const router = useRouter();
  if (!cat) return null;
  return (
    <main className="category-list" style={catVars(cat.id)}>
      <BackBar
        title={cat.kind === "topic" ? "주제" : "시기"}
        onBack={() =>
          goBackFromQuestions(router.history, () => {
            if (edit) void navigate({ to: "/" });
            else void navigate({ to: "/kind/$kind", params: { kind: cat.kind } });
          })
        }
      />
      <div className="px-6 pb-6 pt-2">
        <div className="flex items-center gap-4">
          <span className="flex size-[2.125rem] items-center justify-center rounded-full" style={{ background: cat.color.background }}>
            <span className="inline-flex" style={{ color: cat.color.text }}><CategoryIcon id={cat.id} size={16} /></span>
          </span>
          <h1 className="font-serif text-title">{cat.name}</h1>
        </div>
        <p className="mt-4 text-body">
          {edit ? "수정할 기록을 골라 주세요." : "하나를 골라 시작해요. 모든 질문에 답하지 않아도 돼요."}
        </p>
      </div>
      <ul className="space-y-2 px-6">
        {cat.questions.filter((q) => !edit || hasContent(records[q.id])).map((q) => {
          // Answered questions take their category colour, as on home: the list fills in as you write.
          const done = hasContent(records[q.id]);
          const filled = filledSteps(records[q.id]).filter(Boolean).length;
          return (
            <li key={q.id}>
              <Link
                to="/answer/$qid"
                params={{ qid: q.id }}
                className="flex gap-4 rounded-3xl border border-transparent p-6"
                style={done ? { background: cat.color.background, color: cat.color.text } : { background: "var(--card)", border: "1px solid var(--border)" }}
              >
                <span
                  className="mt-1 flex size-6 shrink-0 items-center justify-center rounded-full border"
                  style={done ? { borderColor: "currentColor" } : { borderColor: "var(--comparison-border)" }}
                  aria-hidden
                >
                  {done && (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m2.5 6 2.5 2.5 4.5-5" />
                    </svg>
                  )}
                </span>
                <span className="min-w-0">
                  <span className="block font-serif text-body">{q.core}</span>
                  {done && (
                    <span className="mt-4 block text-caption">
                      {edit ? "눌러서 수정하기" : filled === 4 ? "다 썼어요 · 눌러서 수정하기" : `4개 중 ${filled}개 · 눌러서 이어쓰기`} ›
                    </span>
                  )}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
