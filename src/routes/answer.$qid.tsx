import { catVars } from "@/lib/theme";
import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { cardColors, categoryOfQuestion, getQuestion } from "@/lib/data";
import { actions, hasContent, recordPhotos, useStore, type Voice } from "@/lib/store";
import { audioKey, deleteAudio, fmtDur, MAX_REC_SEC, putAudio } from "@/lib/audio";
import { VoiceBar } from "@/components/VoicePlayer";
import { toast } from "sonner";
import { deleteMedia, putMedia, useMediaUrl } from "@/lib/media";
import { CategoryPill } from "@/components/CategoryCard";

export const Route = createFileRoute("/answer/$qid")({
  validateSearch: (s: Record<string, unknown>): { step?: number | undefined } => {
    const n = Number(s["step"]);
    return Number.isInteger(n) && n >= 0 && n <= 3 ? { step: n } : {};
  },
  beforeLoad: ({ params }) => {
    if (!getQuestion(params.qid)) throw notFound();
  },
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "답하기 — MyStory" },
      { name: "description", content: "쓰거나 말로 남기세요." },
      { property: "og:title", content: "답하기 — MyStory" },
      { property: "og:description", content: "쓰거나 말로 남기세요." },
    ],
  }),
  component: AnswerFlow,
});

type SR = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onresult: (e: { resultIndex: number; results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } }> }) => void;
  onend: () => void;
  onerror: (e: { error: string }) => void;
};

function Photo({ src, className }: { src: string; className: string }) {
  const url = useMediaUrl(src);
  return url ? <img src={url} alt="첨부한 사진" className={className} /> : <div className={`${className} bg-muted`} aria-hidden />;
}

async function resizeImage(file: File): Promise<Blob> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((res, rej) => {
      const i = new Image();
      i.onload = () => res(i);
      i.onerror = rej;
      i.src = url;
    });
    const scale = Math.min(1, 1200 / Math.max(img.width, img.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(img.width * scale);
    canvas.height = Math.round(img.height * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Image canvas unavailable");
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return await new Promise<Blob>((res, rej) => canvas.toBlob((b) => (b ? res(b) : rej(new Error("toBlob"))), "image/jpeg", 0.8));
  } finally {
    URL.revokeObjectURL(url);
  }
}

function AnswerFlow() {
  const { qid } = Route.useParams();
  const q = getQuestion(qid);
  const category = categoryOfQuestion(qid);
  const cat = category;
  const steps = q ? [q.core, ...q.followUps] : [];
  const { records } = useStore();
  const navigate = useNavigate();

  const startStep = Route.useSearch().step ?? 0;
  const [step, setStep] = useState(startStep);
  const [answers, setAnswers] = useState<string[]>(["", "", "", ""]);
  const [photos, setPhotos] = useState<string[]>([]);
  const [voices, setVoices] = useState<Voice[]>([]);
  const [done, setDone] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [speaking, setSpeaking] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const init = useRef(false);
  // Mirror of the latest values so async recorder callbacks never save stale state.
  const latest = useRef({ answers, photos, voices });
  latest.current = { answers, photos, voices };
  const active = useRef(false);
  const sessionStep = useRef(0);
  const startedAt = useRef(0);
  const micState = useRef<"pending" | "on" | "off">("off");
  const sr = useRef<SR | null>(null);
  const mr = useRef<MediaRecorder | null>(null);
  const stream = useRef<MediaStream | null>(null);
  const chunks = useRef<Blob[]>([]);
  const tick = useRef<number | undefined>(undefined);
  const finishing = useRef<Promise<void> | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (init.current) return;
    const r = records[qid];
    if (r) {
      init.current = true;
      setAnswers([0, 1, 2, 3].map((i) => r.answers[i] ?? ""));
      setPhotos(recordPhotos(r));
      setVoices(r.voices ?? []);
    }
  }, [records, qid]);

  const persist = (a = latest.current.answers, p = latest.current.photos, v = latest.current.voices) => {
    const r = { answers: a, photos: p, voices: v, photo: undefined };
    if (hasContent({ ...r, updatedAt: 0 })) {
      if (!actions.saveRecord(qid, r)) setMsg("저장 공간이 부족해요. 사진을 빼고 다시 시도하세요.");
    } else if (records[qid]) actions.remove([qid]);
  };

  const updateAnswer = (i: number, text: string) => {
    const next = latest.current.answers.map((a, j) => (j === i ? text : a));
    latest.current.answers = next;
    setAnswers(next);
  };

  /** Stops dictation and recording together; resolves once the voice is saved. */
  const stopSpeaking = (): Promise<void> => {
    if (!active.current) return finishing.current ?? Promise.resolve();
    active.current = false;
    window.clearInterval(tick.current);
    setSpeaking(false);
    try {
      sr.current?.stop();
    } catch {
      /* noop */
    }
    sr.current = null;
    const rec = mr.current;
    mr.current = null;
    micState.current = "off";
    const stepAt = sessionStep.current;
    const dur = (Date.now() - startedAt.current) / 1000;
    const releaseMic = () => {
      stream.current?.getTracks().forEach((t) => t.stop());
      stream.current = null;
    };
    const p = new Promise<void>((res) => {
      if (!rec || rec.state === "inactive") {
        releaseMic();
        persist();
        res();
        return;
      }
      rec.onstop = async () => {
        releaseMic();
        const blob = new Blob(chunks.current, { type: rec.mimeType || "audio/mp4" });
        chunks.current = [];
        if (blob.size) {
          try {
            await putAudio(audioKey(qid, stepAt), blob);
            const v = [...latest.current.voices.filter((x) => x.step !== stepAt), { step: stepAt, dur: fmtDur(dur), audio: true }];
            latest.current.voices = v;
            setVoices(v);
          } catch {
            setMsg("목소리를 저장하지 못했어요. 휴대폰 저장 공간을 확인해 주세요.");
          }
        }
        persist();
        res();
      };
      rec.stop();
    });
    finishing.current = p.finally(() => {
      finishing.current = null;
    });
    return finishing.current;
  };

  useEffect(() => () => void stopSpeaking(), []);

  const NOTE_NO_SR = "이 화면에선 글로 바뀌지 않아요. 목소리만 남겨요. 글은 키보드의 받아쓰기 버튼으로 적을 수 있어요.";
  const NOTE_NO_MIC = "마이크 권한이 없어서 목소리는 남기지 못해요. 글로만 옮겨요.";
  const NOTE_NONE = "이 화면에선 말하기가 안 돼요. 글 칸을 누르고 키보드의 받아쓰기 버튼을 써 보세요.";

  /** One tap starts dictation (synchronously, inside the gesture) and then asks for the microphone. */
  const startSpeaking = () => {
    setMsg(null);
    const stepAt = step;
    sessionStep.current = stepAt;
    active.current = true;
    const base = latest.current.answers[stepAt]?.trimEnd() ?? "";
    const prefix = base ? base + " " : "";
    let srOk = false;
    const w = window as unknown as { SpeechRecognition?: new () => SR; webkitSpeechRecognition?: new () => SR };
    const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
    if (Ctor) {
      try {
        const r = new Ctor();
        r.lang = "ko-KR";
        r.continuous = true;
        r.interimResults = true;
        let finalText = "";
        r.onresult = (e) => {
          let interim = "";
          for (let i = e.resultIndex; i < e.results.length; i++) {
            const res = e.results[i];
            if (!res) continue;
            if (res.isFinal) finalText += res[0].transcript;
            else interim += res[0].transcript;
          }
          updateAnswer(stepAt, prefix + (finalText + interim).trim());
        };
        r.onerror = (e) => {
          if (e.error === "no-speech" || e.error === "aborted") return;
          // iOS can refuse dictation while recording: keep the recording, point to keyboard dictation.
          if (micState.current !== "off") setMsg(NOTE_NO_SR);
          else setMsg(NOTE_NONE);
        };
        r.onend = () => {
          sr.current = null;
          if (active.current && micState.current === "off") void stopSpeaking();
        };
        r.start();
        sr.current = r;
        srOk = true;
      } catch {
        srOk = false;
      }
    }
    startedAt.current = Date.now();
    setElapsed(0);
    setSpeaking(true);
    tick.current = window.setInterval(() => {
      const sec = (Date.now() - startedAt.current) / 1000;
      setElapsed(sec);
      if (sec >= MAX_REC_SEC) {
        toast("2분이 되어 멈췄어요");
        void stopSpeaking();
      }
    }, 250);

    const micFail = () => {
      micState.current = "off";
      if (!active.current) return;
      if (srOk && sr.current) setMsg(NOTE_NO_MIC);
      else {
        setMsg(NOTE_NONE);
        void stopSpeaking();
      }
    };
    const md = typeof navigator !== "undefined" ? navigator.mediaDevices : undefined;
    if (!md?.getUserMedia || typeof MediaRecorder === "undefined") return micFail();
    micState.current = "pending";
    md.getUserMedia({ audio: true })
      .then((st) => {
        if (!active.current) {
          st.getTracks().forEach((t) => t.stop());
          return;
        }
        stream.current = st;
        const rec = new MediaRecorder(st);
        chunks.current = [];
        rec.ondataavailable = (e) => e.data.size && chunks.current.push(e.data);
        rec.start(1000);
        mr.current = rec;
        micState.current = "on";
        if (!srOk) setMsg(NOTE_NO_SR);
      })
      .catch(micFail);
  };

  const go = async () => {
    await stopSpeaking();
    persist();
    setMsg(null);
    if (step < 3) {
      setStep(step + 1);
      window.scrollTo({ top: 0 });
    } else if (hasContent({ ...latest.current, updatedAt: 0 })) {
      setDone(true);
    } else {
      navigate({ to: "/cat/$catId", params: { catId: cat?.id ?? "" } });
    }
  };

  const onPhotos = async (files: File[]) => {
    if (!files.length) return;
    const added: string[] = [];
    for (const f of files) {
      try {
        added.push(await putMedia(await resizeImage(f)));
      } catch {
        setMsg("사진 일부를 불러오지 못했어요.");
      }
    }
    if (!added.length) return;
    const next = [...latest.current.photos, ...added];
    latest.current.photos = next;
    setPhotos(next);
    persist();
  };
  const removePhoto = (ref: string) => {
    const next = photos.filter((p) => p !== ref);
    latest.current.photos = next;
    setPhotos(next);
    persist();
    deleteMedia([ref]);
  };
  const voice = voices.find((v) => v.step === step);
  /** Deletes the audio file and its voice entry; the dictated text stays. */
  const deleteVoiceOnly = () => {
    if (!voice) return;
    deleteAudio([audioKey(qid, step)]);
    const next = voices.filter((v) => v !== voice);
    latest.current.voices = next;
    setVoices(next);
    persist();
  };

  if (!cat || !q) return null;
  const c = cardColors(cat);

  if (done) {
    const first = answers.find((a) => a.trim()) ?? "";
    return (
      <main className="px-6 pt-16">
        <p className="text-[1rem] font-medium">기록했습니다.</p>
        <h1 className="mt-2 font-serif text-[1.75rem] leading-[1.4]">이야기 하나가 쌓였어요.</h1>
        <article className="category-surface mt-8 rounded-[32px] p-6 pb-8" style={{ ...catVars(cat.id), background: c.bg, color: c.fg }}>
          <CategoryPill cat={cat} />
          <h2 className="mt-5 font-serif text-[1.5rem] leading-[1.4]">{q.core}</h2>
          {photos[0] && <Photo src={photos[0]} className="mt-5 aspect-[16/10] w-full rounded-3xl object-cover" />}
          {first && <p className="mt-4 line-clamp-4 text-[1.0625rem] leading-[1.7]">{first}</p>}
        </article>
        <div className="mt-8 space-y-2">
          <button
            type="button"
            onClick={() => {
              actions.setView(cat.kind);
              navigate({ to: "/" });
            }}
            className="h-14 w-full rounded-full bg-ink text-[1rem] font-semibold text-ink-foreground"
          >
            홈에서 보기
          </button>
          <Link
            to="/cat/$catId"
            params={{ catId: cat.id }}
            className="flex h-14 w-full items-center justify-center rounded-full border border-ink text-[1rem] font-semibold"
          >
            {cat.name} 더 기록하기
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="category-list flex min-h-app flex-col px-6 pb-[calc(6rem+16px+env(safe-area-inset-bottom))]" style={catVars(cat.id)}>
      <div className="relative flex h-16 items-center justify-between">
        <button
          type="button"
          onClick={async () => {
            await stopSpeaking();
            persist();
            navigate({ to: "/cat/$catId", params: { catId: cat.id } });
          }}
          aria-label="뒤로"
         
          className="-ml-3 flex size-12 items-center justify-center rounded-full"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
            <path d="m15 5-7 7 7 7" />
          </svg>
        </button>
        <p className="pointer-events-none absolute inset-x-12 text-center text-[1rem] font-medium">{cat.name}</p>
      </div>

      <div className="flex items-center gap-3">
      <div className="flex flex-1 gap-1.5" role="progressbar" aria-valuemin={1} aria-valuemax={4} aria-valuenow={step + 1} aria-label="진행">
        {steps.map((_, i) => (
          <span key={i} className="h-1 flex-1 rounded-full transition-colors" style={{ background: i <= step ? "var(--ink)" : "var(--border)" }} />
        ))}
      </div>
      <span className="text-[0.875rem] font-medium tabular-nums" aria-hidden>{step + 1} / {steps.length}</span>
      </div>

      <h1 className="mt-5 font-serif text-[1.625rem] leading-[1.45]">{steps[step]}</h1>
      {step > 0 && <p className="mt-2 text-[0.9375rem]">{q.core}</p>}

      <label className="sr-only" htmlFor="answer">답변</label>
      <textarea
        id="answer"
        value={answers[step]}
        onChange={(e) => setAnswers(answers.map((a, i) => (i === step ? e.target.value : a)))}
        placeholder="한 줄이어도 괜찮아요."
        className="mt-4 min-h-[3.5rem] max-h-[14rem] flex-[1_1_0] w-full resize-none rounded-3xl border border-border bg-card p-5 text-[1.0625rem] leading-[1.7] outline-none placeholder:text-inherit placeholder:opacity-100 focus-visible:ring-2 focus-visible:ring-(--cat-list-accent)"
      />

      {photos.length > 0 && (
        <ul className="mt-3 grid grid-cols-2 gap-2" aria-label={`첨부한 사진 ${photos.length}장`}>
          {photos.map((p, i) => (
            <li key={p} className="relative">
              <Photo src={p} className="aspect-square w-full rounded-3xl object-cover" />
              <button
                type="button"
                onClick={() => removePhoto(p)}
                aria-label={`사진 ${i + 1} 빼기`}
                className="absolute right-2 top-2 h-12 rounded-full border border-border bg-card px-4 text-[0.9375rem] font-medium"
              >
                사진 빼기
              </button>
            </li>
          ))}
        </ul>
      )}

      {voice && (
        <div className="mt-4">
          <div className="rounded-full border border-border bg-card py-1.5 pl-1.5 pr-4">
            <VoiceBar recordId={qid} voice={voice} text={answers[step] || voice.text || ""} fg={cat.kind === "period" ? c.bg : c.pill} accent={cat.kind === "period" ? c.fg : c.pillText} />
          </div>
          <button
            type="button"
            onClick={deleteVoiceOnly}
            disabled={speaking}
            className="mt-1 h-12 px-2 text-[0.9375rem] font-medium underline underline-offset-4 disabled:opacity-40"
          >
            음성만 지우기
          </button>
        </div>
      )}
      <p className="mt-3 text-center text-[0.9375rem] text-muted-foreground">적는 내용은 이 기기에 바로 저장돼요.</p>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => (speaking ? void stopSpeaking() : startSpeaking())}
          aria-pressed={speaking}
          className={`flex h-14 items-center justify-center gap-2 whitespace-nowrap rounded-full px-2 font-medium ${
            speaking ? "bg-destructive text-[0.8125rem] text-destructive-foreground" : "border border-border bg-card text-[1rem]"
          }`}
        >
          {speaking ? `말하는 중 · ${fmtDur(elapsed)} · 누르면 멈춤` : voice ? "다시 말하기" : "말로 하기"}
        </button>
        <button
          type="button"
          onClick={() => {
            void stopSpeaking();
            fileRef.current?.click();
          }}
          className="h-14 rounded-full border border-border bg-card text-[1rem] font-medium"
        >
          {photos.length ? "사진 더 넣기" : "사진 넣기"}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            const files = Array.from(e.target.files ?? []);
            e.target.value = "";
            void onPhotos(files);
          }}
        />
      </div>
      {!voice && <p className="mt-3 text-center text-[0.9375rem] text-muted-foreground">말하면 글로 바뀌고, 목소리도 함께 남아요.</p>}

      {msg && (
        <p role="status" className="mt-3 rounded-2xl bg-muted px-4 py-2.5 text-[0.875rem] leading-[1.55]">
          {msg}
        </p>
      )}

      <div className="mt-auto space-y-2 pt-4">
        <button
          type="button"
          onClick={() => void go()}
         
          className="h-14 w-full rounded-full bg-ink text-[1rem] font-semibold text-ink-foreground"
        >
          {step < 3 ? "다음" : "기록 마치기"}
        </button>
        <button type="button" onClick={() => void go()} className="h-12 w-full rounded-full text-[1rem]">
          다음에 답할게요
        </button>
      </div>
    </main>
  );
}
