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
import { isDemo } from "../lib/demo";
import { DemoPhotoSheet } from "../components/DemoPhotoSheet";

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "default" },
      { name: "apple-mobile-web-app-title", content: "마이스토리" },
      { title: "마이스토리 — 나의 이야기 기록" },
      { name: "description", content: "질문에 답하며 나의 인생 이야기를 기록해요." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "theme-color", content: "#FFFFFF" },
    ],
    links: [
      {
        rel: "stylesheet",
        // Bundled (OFL 1.1) so the exhibition phones never fall back to the system font when the venue Wi-Fi drops.
        href: "/fonts/pretendard/pretendardvariable-dynamic-subset.css",
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

const PRE_PAINT = `try{var d=document.documentElement,p=location.pathname;if(p.indexOf("/s/")!==0){if(sessionStorage.getItem("mystory.launch.seen.v1")!=="1")d.classList.add("ms-pre-launch");if(!localStorage.getItem("ms.onb")&&p.indexOf("/onboarding")!==0&&p!=="/lock")d.classList.add("ms-pre-route")}}catch(e){}`;

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <HeadContent />
        {/* Cover the first paint before hydration so home never flashes before launch/onboarding. */}
        <script dangerouslySetInnerHTML={{ __html: PRE_PAINT }} />
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
    // A share link shows the recipient's page: no lock, onboarding or launch (see /s/$id).
    if (path.startsWith("/s/")) return void document.documentElement.classList.remove("ms-pre-route", "ms-pre-launch");
    let unlocked = false;
    try { unlocked = sessionStorage.getItem("mystory.unlocked") === "1"; } catch { /* noop */ }
    if (!unlocked && path !== "/lock" && getPrefs().pinHash) return void navigate({ to: "/lock", replace: true });
    // First-run onboarding, after the lock is passed.
    if (path !== "/lock" && !path.startsWith("/onboarding") && !onbDone()) navigate({ to: "/onboarding/$n", params: { n: "1" }, replace: true });
  }, [path, navigate]);
  useEffect(() => {
    if (path === "/lock" || path.startsWith("/onboarding") || onbDone()) document.documentElement.classList.remove("ms-pre-route");
  }, [path]);
  // Exhibition persona icons (?p=A|B|C), re-applied after head updates.
  useEffect(() => {
    try {
      const p = resolvePersona(window.location.search, sessionStorage);
      applyPersonaLinks(document, p);
      // Try-out devices (?demo=1) install with a start address that keeps the mode.
      if (!p && isDemo()) document.querySelectorAll<HTMLLinkElement>('link[rel="manifest"]').forEach((e) => e.setAttribute("href", "/manifest-demo.webmanifest"));
    } catch { /* noop */ }
  }, [path]);
  const onb = path.startsWith("/onboarding");
  const fullscreen = onb || path === "/my/export" || path === "/my/share" || path === "/my/share/" || path === "/my/profile" || path.startsWith("/answer") || path.startsWith("/s/");
  const locked = path === "/lock" || fullscreen;
  // Screens for choosing (home, lists, help, MY) use the wide column and go to two columns on a laptop;
  // screens for reading and writing keep the narrower one (see --app-w and --read-w in styles.css).
  const wide = path === "/" || path === "/record" || path === "/help" || path === "/my" || path === "/my/" || path.startsWith("/kind/") || path.startsWith("/cat/") || path.startsWith("/my/continue");

  return (
    <QueryClientProvider client={queryClient}>
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <div className={`mx-auto min-h-app w-full ${wide ? "max-w-app" : "max-w-read"} bg-paper pt-safe ${fullscreen ? "" : "pb-nav"}`}>
        <Outlet />
      </div>
      {!locked && <AppNav />}
      <Toaster position="top-center" />
      <DemoPhotoSheet />
    </QueryClientProvider>
  );
}
