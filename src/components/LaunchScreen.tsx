import { useEffect, useState } from "react";
import wordmark from "@/assets/mystory_wordmark.png.asset.json";

export const LAUNCH_SESSION_KEY = "mystory.launch.seen.v1";

/** Storage is read only after hydration; the app continues mounting underneath. */
export function LaunchScreen() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    try {
      if (sessionStorage.getItem(LAUNCH_SESSION_KEY) === "1") return;
      sessionStorage.setItem(LAUNCH_SESSION_KEY, "1");
    } catch { /* Still allow launch when browser storage is unavailable. */ }
    setVisible(true);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timer = window.setTimeout(() => setVisible(false), reduced ? 600 : 1400);
    return () => window.clearTimeout(timer);
  }, []);

  if (!visible) return null;
  return (
    <div role="img" aria-label="MyStory" className="launch-screen no-print" onClick={() => setVisible(false)}>
      <img src={wordmark.url} alt="" width={1979} height={483} className="launch-wordmark" draggable={false} />
    </div>
  );
}