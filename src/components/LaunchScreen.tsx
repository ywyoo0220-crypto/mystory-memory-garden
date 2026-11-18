import { useEffect, useState } from "react";
import wordmark from "@/assets/mystory_wordmark.png.asset.json";

export const LAUNCH_SESSION_KEY = "mystory.launch.seen.v1";
/**
 * Lines 250–2050ms, sentence out 2900–3500ms, wordmark 3500–4400ms, fade out 5200–5700ms (see styles.css).
 * The colour bleed behind is a pre-rendered video (public/launch/launch_bg.webm, .mp4 fallback; 5.7s) so the phone only decodes video.
 */
export const LAUNCH_MS = 5700;
/** Reduced motion: no video, the last frame as a still with the sentence and wordmark together. */
export const LAUNCH_REDUCED_MS = 3000;
export const LAUNCH_LABEL = "질문에 답하며 나만의 색깔로 채워 가는 이야기, 마이스토리";

/** Storage is read only after hydration; the app continues mounting underneath. */
export function LaunchScreen() {
  const [visible, setVisible] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [leaving, setLeaving] = useState(false);
  useEffect(() => {
    // Pre-paint cover (set in __root) hands over to this overlay, or lifts when already seen.
    const lift = () => document.documentElement.classList.remove("ms-pre-launch");
    if (window.location.pathname.startsWith("/s/")) return lift();
    try {
      if (sessionStorage.getItem(LAUNCH_SESSION_KEY) === "1") return lift();
      sessionStorage.setItem(LAUNCH_SESSION_KEY, "1");
    } catch {
      /* Still allow launch when browser storage is unavailable. */
    }
    const r = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setReduced(r);
    setVisible(true);
    // Home's card entrance waits on this class (see .ms-deck in styles.css).
    const root = document.documentElement;
    root.classList.add("ms-launching");
    requestAnimationFrame(lift);
    const timer = window.setTimeout(() => { root.classList.remove("ms-launching"); setVisible(false); }, r ? LAUNCH_REDUCED_MS : LAUNCH_MS);
    return () => { window.clearTimeout(timer); root.classList.remove("ms-launching"); };
  }, []);

  if (!visible) return null;
  return (
    <div
      role="img"
      aria-label={LAUNCH_LABEL}
      className={`launch-screen no-print${leaving ? " launch-leaving" : ""}`}
      onClick={() => {
        if (leaving) return;
        setLeaving(true);
        document.documentElement.classList.remove("ms-launching");
        window.setTimeout(() => setVisible(false), 250);
      }}
    >
      {reduced ? (
        <img src="/launch/launch_bg_poster.webp" alt="" className="launch-bg" draggable={false} />
      ) : (
        <video className="launch-bg" autoPlay muted playsInline preload="auto" aria-hidden="true">
          <source src="/launch/launch_bg.webm" type="video/webm" />
          <source src="/launch/launch_bg.mp4" type="video/mp4" />
        </video>
      )}
      <div className="launch-grain" aria-hidden="true" />
      <div className="launch-stack">
        <p className="launch-lede" aria-hidden="true">
          <span className="launch-line launch-line-1">질문에 답하며</span>
          <span className="launch-line launch-line-2">나만의 색깔로</span>
          <span className="launch-line launch-line-3">채워 가는 이야기</span>
        </p>
        <img
          src={wordmark.url}
          alt=""
          width={1979}
          height={483}
          className="launch-wordmark"
          draggable={false}
        />
      </div>
    </div>
  );
}
