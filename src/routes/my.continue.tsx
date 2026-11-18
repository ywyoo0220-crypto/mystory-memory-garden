import { createFileRoute } from "@tanstack/react-router";
import { hasContent, isIncomplete, useStore } from "@/lib/store";
import { ContinueCard, SubHeader } from "@/components/my/ui";

export const Route = createFileRoute("/my/continue")({
  head: () => ({
    meta: [
      { title: "이어서 쓰기 — MyStory" },
      { name: "description", content: "쓰다 만 기록을 모아 이어서 써요." },
      { property: "og:title", content: "이어서 쓰기 — MyStory" },
      { property: "og:description", content: "쓰다 만 기록을 모아 이어서 써요." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Continue,
});

function Continue() {
  const { records } = useStore();
  const list = Object.entries(records)
    .filter(([, r]) => hasContent(r) && isIncomplete(r))
    .sort((a, b) => b[1].updatedAt - a[1].updatedAt);
  return (
    <main className="pb-6">
      <SubHeader title="이어서 쓰기" sub="쓰다 멈춘 이야기를 이어서 완성해요." />
      <div className="space-y-4 px-6">
        {list.length === 0 ? (
          <p className="py-12 text-center text-body text-muted-foreground">쓰다 만 기록이 없어요.</p>
        ) : (
          list.map(([q, r]) => <ContinueCard key={q} qid={q} rec={r} />)
        )}
      </div>
    </main>
  );
}
