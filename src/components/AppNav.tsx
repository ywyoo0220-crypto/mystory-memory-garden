import { Link, useRouterState } from "@tanstack/react-router";
import { useStore } from "@/lib/store";
import { TextSizeButton } from "@/components/TextSizeButton";

const items = [
  { to: "/", label: "홈", match: (p: string) => p === "/" },
  {
    to: "/record",
    label: "기록하기",
    match: (p: string) => p.startsWith("/record") || p.startsWith("/kind") || p.startsWith("/cat") || p.startsWith("/answer"),
  },
  { to: "/help", label: "도움말", match: (p: string) => p.startsWith("/help") },
  { to: "/my", label: "MY", match: (p: string) => p.startsWith("/my") },
] as const;

export function AppNav() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { large } = useStore();
  return (
    <nav
      aria-label="주요 메뉴"
      className="fixed inset-x-0 bottom-[calc(16px+env(safe-area-inset-bottom))] z-40 mx-auto flex w-full max-w-[440px] items-center"
    >
      <div aria-hidden={true} className="min-w-0 shrink grow-0 basis-[11%]" />
      <div className="flex shrink-0 items-center rounded-full border border-border bg-card p-1 shadow-[0_6px_24px_-8px_rgb(26_25_24/0.25)]">
        {items.map((it) => {
          const active = it.match(path);
          return (
            <Link
              key={it.to}
              to={it.to}
              aria-current={active ? "page" : undefined}
              className={`flex h-12 min-w-[42px] shrink items-center justify-center whitespace-nowrap rounded-full text-caption font-medium transition-colors ${large ? "px-[clamp(6px,2.4vw,14px)]" : "px-[clamp(8px,4vw,22px)]"} ${
                active ? "bg-ink text-ink-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {it.label}
            </Link>
          );
        })}
      </div>
      <div aria-hidden={true} className="min-w-0 flex-1" />
      <TextSizeButton className="size-[min(3.75rem,14vw)] min-h-[48px] min-w-[48px]" />
      <div aria-hidden={true} className="min-w-0 flex-1" />
    </nav>
  );
}
