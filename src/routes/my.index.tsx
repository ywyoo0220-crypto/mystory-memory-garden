import { createFileRoute, Link } from "@tanstack/react-router";
import { hasContent, isIncomplete, useStore } from "@/lib/store";
import { usePrefs } from "@/lib/prefs";
import { Avatar, Card, Chevron, rowCls } from "@/components/my/ui";

export const Route = createFileRoute("/my/")({
  head: () => ({
    meta: [
      { title: "MY — MyStory" },
      { name: "description", content: "프로필, 이어서 쓰기, 책 만들기, 공유, 백업과 설정." },
      { property: "og:title", content: "MY — MyStory" },
      { property: "og:description", content: "프로필, 이어서 쓰기, 책 만들기, 공유, 백업과 설정." },
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
    ["/my/continue", "이어서 쓰기", incomplete.length ? `작성 중인 기록 ${incomplete.length}개` : "작성 중인 기록 없음"],
    ["/my/export", "기록 책으로 묶기", "PDF로 저장해요"],
    ["/my/share", "기록 공유하기", sharedN ? `${sharedN}개 공유 설정됨` : "보여줄 사람을 직접 정해요"],
    ["/my/backup", "백업과 복원", "기기를 바꿔도 기록을 지켜요"],
    ["/my/settings", "설정", `글자 ${["보통", "크게"][textSize]} · 앱 잠금 ${pinHash ? "켜짐" : "꺼짐"}`],
  ];
  return (
    <main className="space-y-4 px-6 pt-6">
      <Link to="/my/profile" className="flex min-h-16 items-center gap-4 px-2 py-2">
        <Avatar name={profile.name} photo={profile.photo} size={56} />
        <span className="min-w-0 flex-1">
          <span className="block text-title font-medium">{profile.name || "프로필 만들기"}</span>
          <span className="block text-caption text-muted-foreground">{sub}</span>
        </span>
        <Chevron />
      </Link>

      <Card className="divide-y overflow-hidden">
        {menu.map(([to, t, s]) => (
          <Link key={to} to={to} className={rowCls}>
            <span className="min-w-0 flex-1">
              <span className="block text-body font-medium">{t}</span>
              <span className="block text-caption text-muted-foreground">{s}</span>
            </span>
            <Chevron />
          </Link>
        ))}
      </Card>
    </main>
  );
}
