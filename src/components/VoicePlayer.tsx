import { useEffect, useRef, useState } from "react";
import { Button } from "./ui/button";

const bars = Array.from({ length: 44 }, (_, i) => 0.25 + 0.75 * Math.abs(Math.sin(i * 1.7) * Math.cos(i * 0.6)));

export function VoicePlayer({ text, durationSec, fg, accent }: { text: string; durationSec: number; fg: string; accent: string }) {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const timer = useRef<number | undefined>(undefined);

  const stop = () => {
    window.clearInterval(timer.current);
    try {
      window.speechSynthesis?.cancel();
    } catch {
      /* noop */
    }
    setPlaying(false);
    setProgress(0);
  };
  useEffect(() => stop, []);

  const play = () => {
    if (playing) return stop();
    setPlaying(true);
    try {
      const u = new SpeechSynthesisUtterance(text);
      u.lang = "ko-KR";
      u.rate = 0.95;
      u.onend = stop;
      window.speechSynthesis?.speak(u);
    } catch {
      /* speech output unavailable: animate only */
    }
    const start = Date.now();
    timer.current = window.setInterval(() => {
      const p = (Date.now() - start) / (durationSec * 1000);
      if (p >= 1) stop();
      else setProgress(p);
    }, 100);
  };

  const m = Math.floor(durationSec / 60);
  const s = String(Math.round(durationSec % 60)).padStart(2, "0");
  return (
    <div className="flex items-center gap-3">
      <Button variant="palette"
        type="button"
        onClick={play}
        aria-label={playing ? "음성 멈추기" : "음성 듣기"}
        aria-pressed={playing}
        className="flex size-12 shrink-0 items-center justify-center rounded-full"
        style={{ background: fg, color: accent }}
      >
        {playing ? (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
            <rect x="3" y="2" width="3.5" height="12" rx="1" />
            <rect x="9.5" y="2" width="3.5" height="12" rx="1" />
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
            <path d="M4 2.5v11l9.5-5.5z" />
          </svg>
        )}
      </Button>
      <div className="flex h-8 flex-1 items-center gap-[2px]" aria-hidden>
        {bars.map((h, i) => (
          <span
            key={i}
            className="w-[2px] flex-1 rounded-full"
            style={{ height: `${h * 100}%`, background: fg, opacity: i / bars.length <= progress ? 1 : 0.35 }}
          />
        ))}
      </div>
      <span className="text-[0.8125rem] font-medium tabular-nums" style={{ color: fg }}>
        {m}:{s}
      </span>
    </div>
  );
}
