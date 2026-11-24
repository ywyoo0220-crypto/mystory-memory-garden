import { createFileRoute, Link } from "@tanstack/react-router";
import { hasContent, isIncomplete, useStore } from "@/lib/store";
import { usePrefs } from "@/lib/prefs";
import { Avatar, Card, Chevron, rowCls } from "@/components/my/ui";

export const Route = createFileRoute("/my/")({
  head: () => ({
    meta: [
      { title: "MY — 마이스토리" },
      { name: "description", content: "프로필, 이어서 쓰기, 책 만들기, 공유, 백업과 설정." },
      { property: "og:title", content: "MY — 마이스토리" },
      { property: "og:description", content: "프로필, 이어서 쓰기, 책 만들기, 공유, 백업과 설정." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: My,
});

function My() {
  const { records, textSize } = useStore();
  const { profile, pinHash } = usePrefs();
  const entries = Object.entries(records).filter(([, r]) => hasContent(r));
  const incomplete = entries.filter(([, r]) => isIncomplete(r)).sort((a, b) => b[1].updatedAt - a[1].updatedAt);
  const sub = [profile.birth && `${profile.birth}년생`, profile.birthplace && `${profile.birthplace} 출생`, `기록 ${entries.length}개`].filter(Boolean).join(" · ");
  const groups: [string, [string, string, string][]][] = [
    ["내 기록", [
      ["/my/continue", "이어서 쓰기", incomplete.length ? `작성 중인 기록 ${incomplete.length}개` : "작성 중인 기록 없음"],
      ["/my/share", "기록 공유하기", "고른 기록을 링크로 보여줘요"],
      ["/my/book", "책으로 만들기", "기록이 이런 책이 돼요"],
    ]],
    ["보관과 보안", [
      ["/my/backup", "백업과 복원", "기기를 바꿔도 기록을 지켜요"],
      ["/my/settings/lock", "비밀번호 잠금", pinHash ? "켜짐 · 숫자 4자리로 열어요" : "꺼짐 · 숫자 4자리로 앱을 잠가요"],
    ]],
    ["앱 환경", [["/my/settings", "설정", `글자 ${["보통", "크게"][textSize]} · 처음 안내 · 예시 기록`]]],
  ];
  return (
    <main className="space-y-6 px-6 pb-32 pt-6">
      <Link to="/my/profile" className="flex items-center gap-4 rounded-[20px] border border-border bg-card p-5">
        <span className="shrink-0 rounded-full border-2 border-card shadow-[0_0_0_1px_var(--comparison-border)]">
          <Avatar name={profile.name} photo={profile.photo} size={64} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-caption font-medium text-muted-foreground">기록자</span>
          <span className="mt-1 block text-title">{profile.name || "프로필 만들기"}</span>
          <span className="mt-1 block text-caption text-muted-foreground">{sub}</span>
        </span>
        <Chevron />
      </Link>

      {/* Laptop: "내 기록" on the left, the other two groups stacked on the right. */}
      <div className="space-y-6 desk:grid desk:grid-cols-2 desk:items-start desk:gap-6 desk:space-y-0">
        {[groups.slice(0, 1), groups.slice(1)].map((column, c) => (
          <div key={c} className="space-y-6">
            {column.map(([title, items]) => (
              <section key={title} aria-label={title}>
                <h2 className="mb-2 px-2 text-caption font-medium text-muted-foreground">{title}</h2>
                <Card className="divide-y overflow-hidden">
                  {items.map(([to, t, s]) => (
                    <Link key={to} to={to} className={rowCls}>
                      <span className="min-w-0 flex-1">
                        <span className="block text-body font-medium">{t}</span>
                        <span className="block text-caption text-muted-foreground">{s}</span>
                      </span>
                      <Chevron />
                    </Link>
                  ))}
                </Card>
              </section>
            ))}
          </div>
        ))}
      </div>
    </main>
  );
}
