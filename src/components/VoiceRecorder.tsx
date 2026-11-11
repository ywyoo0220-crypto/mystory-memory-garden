import { useEffect, useRef, useState } from "react";
import { putMedia } from "@/lib/media";
import type { AudioClip } from "@/lib/store";
import { RecordedClip } from "./VoicePlayer";

type Phase = "idle" | "starting" | "recording" | "paused" | "saving";

const fmt = (ms: number) => {
  const t = Math.floor(ms / 1000);
  return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, "0")}`;
};

function pickMime() {
  const list = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4"];
  try {
    return list.find((t) => MediaRecorder.isTypeSupported?.(t));
  } catch {
    return undefined;
  }
}

export function VoiceRecorder({
  step,
  clip,
  disabled,
  onBusy,
  onSave,
  onDelete,
  onMessage,
}: {
  step: number;
  clip?: AudioClip | undefined;
  disabled?: boolean;
  onBusy: (busy: boolean) => void;
  onSave: (clip: AudioClip) => void;
  onDelete: () => void;
  onMessage: (m: string | null) => void;
}) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [elapsed, setElapsed] = useState(0);
  const rec = useRef<MediaRecorder | null>(null);
  const stream = useRef<MediaStream | null>(null);
  const acc = useRef(0);
  const since = useRef(0);
  const timer = useRef<number | undefined>(undefined);
  const canPause = typeof MediaRecorder !== "undefined" && typeof MediaRecorder.prototype.pause === "function";

  useEffect(() => onBusy(phase !== "idle"), [phase, onBusy]);

  const release = () => {
    window.clearInterval(timer.current);
    stream.current?.getTracks().forEach((t) => t.stop());
    stream.current = null;
  };
  useEffect(
    () => () => {
      const r = rec.current;
      if (r && r.state !== "inactive") {
        r.onstop = null;
        r.stop();
      }
      release();
    },
    [],
  );

  const total = () => acc.current + (since.current ? Date.now() - since.current : 0);

  const start = async () => {
    onMessage(null);
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      onMessage("이 브라우저에서는 녹음할 수 없어요. 최신 Safari나 Chrome에서 열어 주세요.");
      return;
    }
    setPhase("starting");
    let s: MediaStream;
    try {
      s = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (e) {
      setPhase("idle");
      const n = (e as DOMException)?.name;
      onMessage(
        n === "NotAllowedError" || n === "SecurityError"
          ? "마이크 사용이 허락되지 않았어요. 휴대폰 설정에서 이 브라우저의 마이크를 허용한 뒤 다시 눌러 주세요."
          : n === "NotFoundError"
            ? "마이크를 찾지 못했어요."
            : "녹음을 시작하지 못했어요. 다시 눌러 주세요.",
      );
      return;
    }
    stream.current = s;
    const mime = pickMime();
    let r: MediaRecorder;
    try {
      r = mime ? new MediaRecorder(s, { mimeType: mime }) : new MediaRecorder(s);
    } catch {
      release();
      setPhase("idle");
      onMessage("녹음을 시작하지 못했어요. 다시 눌러 주세요.");
      return;
    }
    const chunks: Blob[] = [];
    r.ondataavailable = (e) => {
      if (e.data.size) chunks.push(e.data);
    };
    r.onstop = async () => {
      release();
      const durationSec = Math.max(1, Math.round(total() / 1000));
      since.current = 0;
      setPhase("saving");
      const blob = new Blob(chunks, { type: r.mimeType || mime || "audio/mp4" });
      try {
        const id = await putMedia(blob);
        onSave({ id, durationSec, mime: blob.type, step });
      } catch {
        onMessage("녹음을 저장하지 못했어요. 휴대폰 저장 공간을 확인해 주세요.");
      }
      setElapsed(0);
      setPhase("idle");
    };
    rec.current = r;
    r.start(1000);
    acc.current = 0;
    since.current = Date.now();
    setElapsed(0);
    timer.current = window.setInterval(() => setElapsed(total()), 250);
    setPhase("recording");
  };

  const pause = () => {
    const r = rec.current;
    if (!r) return;
    if (phase === "recording") {
      r.pause();
      acc.current = total();
      since.current = 0;
      setPhase("paused");
    } else {
      r.resume();
      since.current = Date.now();
      setPhase("recording");
    }
  };

  const stop = () => {
    acc.current = total();
    since.current = 0;
    rec.current?.stop();
  };

  const big = "flex h-14 items-center justify-center gap-2 rounded-full text-[1rem] font-medium disabled:opacity-40";

  if (phase === "recording" || phase === "paused" || phase === "saving") {
    return (
      <div className="mt-3 rounded-3xl bg-card p-5">
        <div className="flex items-center justify-between" role="status" aria-live="polite">
          <span className="flex items-center gap-2 text-[1rem] font-medium">
            <span
              className={`size-3 rounded-full bg-destructive ${phase === "recording" ? "animate-pulse" : "opacity-40"}`}
              aria-hidden
            />
            {phase === "recording" ? "녹음 중" : phase === "paused" ? "잠시 멈춤" : "저장하는 중"}
          </span>
          <span className="text-[2rem] font-semibold tabular-nums" role="timer" aria-label="녹음 시간">
            {fmt(elapsed)}
          </span>
        </div>
        <div className={`mt-4 grid gap-2 ${canPause ? "grid-cols-2" : "grid-cols-1"}`}>
          {canPause && (
            <button type="button" onClick={pause} disabled={phase === "saving"} className={`${big} border border-current`}>
              {phase === "paused" ? "이어서 녹음" : "잠시 멈추기"}
            </button>
          )}
          <button
            type="button"
            onClick={stop}
            disabled={phase === "saving"}
            className={`${big} bg-(--cat-bg) font-semibold text-(--cat-text)`}
          >
            녹음 마치기
          </button>
        </div>
      </div>
    );
  }

  if (clip) {
    return (
      <div className="mt-3 space-y-4 rounded-3xl bg-card p-5">
        <p className="text-[1rem] font-medium">녹음한 목소리</p>
        <RecordedClip clip={clip} fg="var(--cat-pill)" accent="var(--card)" />
        <div className="grid grid-cols-2 gap-2">
          <button type="button" onClick={start} disabled={disabled} className={`${big} border border-current`}>
            다시 녹음
          </button>
          <button
            type="button"
            onClick={() => window.confirm("녹음을 지울까요?") && onDelete()}
            className={`${big} border border-current`}
          >
            녹음 지우기
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={start}
      disabled={disabled || phase === "starting"}
      className={`${big} mt-2 w-full bg-card`}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
        <rect x="9" y="3" width="6" height="12" rx="3" />
        <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
      </svg>
      {phase === "starting" ? "마이크 준비 중…" : "목소리 녹음하기"}
    </button>
  );
}
