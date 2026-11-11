import { Link, useRouterState } from "@tanstack/react-router";
import { actions, useStore } from "@/lib/store";

const items = [
  { to: "/", label: "홈", match: (p: string) => p === "/" },
  {
    to: "/record",
    label: "기록하기",
    match: (p: string) => p.startsWith("/record") || p.startsWith("/kind") || p.startsWith("/cat"),
  },
  { to: "/help", label: "도움말", match: (p: string) => p.startsWith("/help") },
  { to: "/my", label: "MY", match: (p: string) => p.startsWith("/my") },
] as const;

export function AppNav() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { large } = useStore();
  if (path.startsWith("/answer")) return null;
  return (
    <nav
      aria-label="주요 메뉴"
      className="fixed inset-x-0 bottom-[calc(16px+env(safe-area-inset-bottom))] z-40 mx-auto flex w-full max-w-[440px] items-center justify-center gap-[min(1rem,3vw)] px-3"
    >
      <div className="flex min-w-0 items-center rounded-full bg-card p-1 shadow-[0_6px_24px_-8px_rgb(26_25_24/0.25)]">
        {items.map((it) => {
          const active = it.match(path);
          return (
            <Link
              key={it.to}
              to={it.to}
              aria-current={active ? "page" : undefined}
              className={`flex h-12 min-w-12 shrink items-center justify-center whitespace-nowrap rounded-full px-[min(1rem,3.2vw)] text-[0.9375rem] font-medium transition-colors ${
                active ? "bg-ink text-ink-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {it.label}
            </Link>
          );
        })}
      </div>
      <button
        type="button"
        onClick={actions.toggleLarge}
        aria-pressed={large}
        aria-label="글자 크게 보기"
        className="flex size-[min(3.75rem,15vw)] min-h-12 min-w-12 shrink-0 items-center justify-center rounded-full bg-ink text-[0.9375rem] font-semibold text-ink-foreground"
      >
        {large ? "보통" : "크게"}
      </button>
    </nav>
  );
}
