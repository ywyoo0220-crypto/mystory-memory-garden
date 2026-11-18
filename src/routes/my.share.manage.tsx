import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { shareUrl } from "@/lib/share";
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
          return (
            <Card key={s.id} className="p-6">
              <p className="text-body font-medium">{SCOPES.find((x) => x[0] === s.scope)?.[1]} 공유 중</p>
              <p className="mt-1 text-caption text-muted-foreground">
                이야기 {s.qids.length}개 · {s.withVoice ? "목소리 포함" : "글로만"} · {d.getFullYear()}.{d.getMonth() + 1}.{d.getDate()}
              </p>
              <div className="mt-4 flex gap-2">
                <Link to="/s/$id" params={{ id: s.id }} className="inline-flex h-12 flex-1 items-center justify-center rounded-full border border-ink text-caption font-medium">화면 보기</Link>
                <button type="button" className="h-12 flex-1 rounded-full border border-ink text-caption font-medium" onClick={() => void navigator.clipboard?.writeText(s.link || shareUrl(s.id)).then(() => toast("링크를 복사했어요"), () => {})}>링크 복사</button>
                <button type="button" className="h-12 rounded-full bg-destructive/10 px-4 text-caption font-medium text-destructive" onClick={() => prefs.removeShares([s.id])}>해제</button>
              </div>
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
