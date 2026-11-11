import { createFileRoute, Link } from "@tanstack/react-router";
import { periods, topics } from "@/lib/data";
import { hasContent, isIncomplete, useStore } from "@/lib/store";
import { usePrefs } from "@/lib/prefs";
import { Avatar, Card, Chevron, ContinueCard, Dot, rowCls } from "@/components/my/ui";

export const Route = createFileRoute("/my/")({
  head: () => ({
    meta: [
      { title: "MY — myStory" },
      { name: "description", content: "프로필, 아카이브, 책 만들기, 공유, 백업과 설정." },
      { property: "og:title", content: "MY — myStory" },
      { property: "og:description", content: "프로필, 아카이브, 책 만들기, 공유, 백업과 설정." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: My,
});

function My() {
  const { records, textSize } = useStore();
  const { profile, shares, pinHash } = usePrefs();
  const entries = Object.entries(records).filter(([, r]) => hasContent(r));
  const incomplete = entries.filter(([, r]) => isIncomplete(r)).sort((a, b) => b[1].updatedAt - a[1].updatedAt);
  const sharedN = new Set(shares.flatMap((s) => s.qids)).size;
  const sub = [profile.birth && `${profile.birth}년생`, `기록 ${entries.length}개`].filter(Boolean).join(" · ");
  const menu: [string, string, string][] = [
    ["/my/export", "기록 책으로 묶기", "PDF로 저장해요"],
    ["/my/share", "기록 공유하기", sharedN ? `${sharedN}개 공유 중` : "보여줄 사람을 직접 정해요"],
    ["/my/backup", "백업과 복원", "기기를 바꿔도 기록을 지켜요"],
    ["/my/settings", "설정", `글자 ${["보통", "크게", "아주 크게"][textSize]} · 앱 잠금 ${pinHash ? "켜짐" : "꺼짐"}`],
  ];
  return (
    <main className="space-y-4 px-4 pt-6">
      <Link to="/my/profile" className="flex min-h-16 items-center gap-4 px-2 py-2">
        <Avatar name={profile.name} photo={profile.photo} size={56} />
        <span className="min-w-0 flex-1">
          <span className="block text-[1.25rem] font-bold">{profile.name || "프로필 만들기"}</span>
          <span className="block text-[0.875rem] text-muted-foreground">{sub}</span>
        </span>
        <Chevron />
      </Link>

      <Link to="/my/archive" className="block">
        <Card className="space-y-3 p-5">
          <h2 className="text-[1.0625rem] font-bold">나의 아카이브</h2>
          <DotRow label="주제" cats={topics} records={records} />
          <DotRow label="시기" cats={periods} records={records} />
          <p className="pt-1 text-[0.9375rem] font-medium">나의 아카이브 자세히 보기 ›</p>
        </Card>
      </Link>

      {incomplete[0] && (
        <section>
          <h2 className="px-2 pb-2 text-[0.9375rem] font-bold">이어서 쓰기 · {incomplete.length}개</h2>
          <ContinueCard qid={incomplete[0][0]} rec={incomplete[0][1]} />
        </section>
      )}

      <Card className="divide-y overflow-hidden">
        {menu.map(([to, t, s]) => (
          <Link key={to} to={to} className={rowCls}>
            <span className="min-w-0 flex-1">
              <span className="block text-[1.0625rem] font-medium">{t}</span>
              <span className="block text-[0.875rem] text-muted-foreground">{s}</span>
            </span>
            <Chevron />
          </Link>
        ))}
      </Card>
    </main>
  );
}

function DotRow({ label, cats, records }: { label: string; cats: typeof topics; records: ReturnType<typeof useStore>["records"] }) {
  const has = cats.map((c) => c.questions.some((q) => hasContent(records[q.id])));
  return (
    <div className="flex items-center gap-3">
      <span className="w-8 shrink-0 text-[0.875rem] text-muted-foreground">{label}</span>
      <span className="flex flex-1 flex-wrap gap-1.5">
        {cats.map((c, i) => (
          <Dot key={c.id} catId={c.id} filled={!!has[i]} size={14} />
        ))}
      </span>
      <span className="text-[0.875rem] font-medium tabular-nums">
        {has.filter(Boolean).length}/{cats.length}
      </span>
    </div>
  );
}
