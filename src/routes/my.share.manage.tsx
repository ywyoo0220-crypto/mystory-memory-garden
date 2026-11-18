import { createFileRoute, Link } from "@tanstack/react-router";
import { categoryOfQuestion } from "@/lib/data";
import { prefs, SCOPES, usePrefs } from "@/lib/prefs";
import { Card, SubHeader } from "@/components/my/ui";

export const Route = createFileRoute("/my/share/manage")({
  head: () => ({
    meta: [
      { title: "공유 관리 — MyStory" },
      { name: "description", content: "공유 설정한 기록을 보고 언제든 해제해요." },
      { property: "og:title", content: "공유 관리 — MyStory" },
      { property: "og:description", content: "공유 설정한 기록을 보고 언제든 해제해요." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Manage,
});

function Manage() {
  const { shares } = usePrefs();
  return (
    <main className="pb-6">
      <SubHeader title="공유 관리" back="/my/share" />
      <div className="space-y-4 px-6">
        {shares.length === 0 && <p className="py-8 text-center text-muted-foreground">공유 설정한 기록이 없어요.</p>}
        {shares.map((s) => {
          const d = new Date(s.t);
          const cats = [...new Set(s.qids.map((q) => categoryOfQuestion(q)?.name).filter(Boolean))].join(", ");
          return (
            <Card key={s.id} className="flex items-start gap-4 p-6">
              <div className="min-w-0 flex-1">
                <p className="text-body font-medium">
                  기록 {s.qids.length}개 · {SCOPES.find((x) => x[0] === s.scope)?.[1]}
                </p>
                <p className="mt-1 text-caption text-muted-foreground">
                  {d.getFullYear()}년 {d.getMonth() + 1}월 {d.getDate()}일 · {s.withVoice ? "목소리 포함" : "목소리는 글로만"}
                </p>
                <p className="mt-1 text-caption text-muted-foreground">{cats}</p>
                {s.link && <p className="mt-1 break-all text-caption">{s.link}</p>}
                <Link to="/s/$id" params={{ id: s.id }} className="mt-1 inline-flex h-12 items-center text-caption font-medium underline underline-offset-4">받는 사람 화면 보기</Link>
              </div>
              <button type="button" className="h-12 shrink-0 rounded-full border border-ink px-6 text-caption font-medium" onClick={() => prefs.removeShares([s.id])}>
                해제
              </button>
            </Card>
          );
        })}
        {shares.length > 0 && (
          <button type="button" className="flex h-14 w-full items-center justify-center rounded-full bg-destructive/10 text-body font-medium text-destructive" onClick={() => prefs.removeShares()}>
            모두 해제하기
          </button>
        )}
      </div>
    </main>
  );
}
