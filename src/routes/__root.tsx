import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  createRootRouteWithContext,
  useRouterState,
  useNavigate,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { ErrorComponent, NotFoundComponent } from "../components/AppErrorScreens";
import { LaunchScreen } from "../components/LaunchScreen";
import { AppNav } from "../components/AppNav";
import { Toaster } from "../components/ui/sonner";
import { themeCss } from "../lib/theme";
import { getPrefs } from "../lib/prefs";
import { onbDone } from "../lib/onboarding";
import { applyPersonaLinks, resolvePersona } from "../lib/persona";

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "default" },
      { name: "apple-mobile-web-app-title", content: "MyStory" },
      { title: "MyStory — 나의 이야기 기록" },
      { name: "description", content: "질문에 답하며 나의 인생 이야기를 기록하세요." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "theme-color", content: "#F5F5F7" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: "https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css",
      },
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "icon", href: "/favicon.png", type: "image/png" },
      { rel: "manifest", href: "/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png", sizes: "180x180" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <HeadContent />
        <style dangerouslySetInnerHTML={{ __html: themeCss() }} />
      </head>
      <body>
        {children}
        <LaunchScreen />
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  // App lock: once per launch (session), send to /lock while a PIN is set.
  useEffect(() => {
    let unlocked = false;
    try { unlocked = sessionStorage.getItem("mystory.unlocked") === "1"; } catch { /* noop */ }
    if (!unlocked && path !== "/lock" && getPrefs().pinHash) return void navigate({ to: "/lock", replace: true });
    // First-run onboarding, after the lock is passed.
    if (path !== "/lock" && !path.startsWith("/onboarding") && !onbDone()) navigate({ to: "/onboarding/$n", params: { n: "1" }, replace: true });
  }, [path, navigate]);
  // Exhibition persona icons (?p=A|B|C), re-applied after head updates.
  useEffect(() => {
    try { applyPersonaLinks(document, resolvePersona(window.location.search, sessionStorage)); } catch { /* noop */ }
  }, [path]);
  const onb = path.startsWith("/onboarding");
  const fullscreen = onb || path === "/my/export" || path.startsWith("/answer");
  const locked = path === "/lock" || fullscreen;

  return (
    <QueryClientProvider client={queryClient}>
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <div className={`mx-auto min-h-app w-full max-w-[440px] bg-paper pt-safe ${fullscreen ? "" : "pb-nav"}`}>
        <Outlet />
      </div>
      {!locked && <AppNav />}
      <Toaster position="top-center" />
    </QueryClientProvider>
  );
}
