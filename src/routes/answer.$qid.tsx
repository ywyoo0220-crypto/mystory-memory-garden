import { catVars } from "@/lib/theme";
import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { cardColors, categoryOfQuestion, getQuestion } from "@/lib/data";
import { actions, hasContent, recordPhotos, useStore, type AudioClip, type StoryRecord } from "@/lib/store";
import { deleteMedia, putMedia, useMediaUrl } from "@/lib/media";
import { VoiceRecorder } from "@/components/VoiceRecorder";
import { CategoryPill } from "@/components/CategoryCard";

export const Route = createFileRoute("/answer/$qid")({
  beforeLoad: ({ params }) => {
    if (!getQuestion(params.qid)) throw notFound();
  },
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "답하기 — myStory" },
      { name: "description", content: "쓰거나 말로 남기세요." },
      { property: "og:title", content: "답하기 — myStory" },
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

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>(["", "", "", ""]);
  const [photos, setPhotos] = useState<string[]>([]);
  const [audios, setAudios] = useState<AudioClip[]>([]);
  const [recBusy, setRecBusy] = useState(false);
  const [voice, setVoice] = useState<StoryRecord["voice"]>();
  const [done, setDone] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [listening, setListening] = useState(false);
  const init = useRef(false);
  const rec = useRef<SR | null>(null);
  const voiceStart = useRef(0);
  const baseText = useRef("");
  const heard = useRef("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (init.current) return;
    const r = records[qid];
    if (r) {
      init.current = true;
      setAnswers([0, 1, 2, 3].map((i) => r.answers[i] ?? ""));
      setPhotos(recordPhotos(r));
      setAudios(r.audios ?? []);
      setVoice(r.voice);
    }
  }, [records, qid]);

  useEffect(() => () => rec.current?.stop(), []);

  const persist = (a = answers, p = photos, au = audios, v = voice) => {
    const r = { answers: a, photos: p, audios: au, photo: undefined, voice: v };
    if (hasContent({ ...r, updatedAt: 0 })) {
      if (!actions.saveRecord(qid, r)) setMsg("저장 공간이 부족해요. 사진을 빼고 다시 시도하세요.");
    } else if (records[qid]) actions.remove([qid]);
  };

  const stopListening = () => {
    rec.current?.stop();
  };

  const startListening = () => {
    const w = window as unknown as { SpeechRecognition?: new () => SR; webkitSpeechRecognition?: new () => SR };
    const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
    if (!Ctor) {
      setMsg("이 브라우저는 말로 입력을 지원하지 않아요. 키보드의 마이크 버튼을 눌러 말해 보세요.");
      return;
    }
    setMsg(null);
    const r = new Ctor();
    r.lang = "ko-KR";
    r.continuous = true;
    r.interimResults = true;
    baseText.current = answers[step] ? answers[step].trimEnd() + " " : "";
    heard.current = "";
    let finalText = "";
    r.onresult = (e) => {
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const res = e.results[i];
        if (!res) continue;
        const t = res[0].transcript;
        if (res.isFinal) finalText += t;
        else interim += t;
      }
      heard.current = (finalText + interim).trim();
      setAnswers((prev) => prev.map((a, i) => (i === step ? baseText.current + heard.current : a)));
    };
    r.onerror = (e) => {
      if (e.error === "not-allowed") setMsg("마이크 사용을 허락해 주세요. 또는 키보드의 마이크 버튼을 이용하세요.");
      else if (e.error !== "no-speech" && e.error !== "aborted") setMsg("말을 알아듣지 못했어요. 다시 해 보세요.");
    };
    r.onend = () => {
      setListening(false);
      rec.current = null;
      if (heard.current) {
        const dur = Math.max(1, Math.round((Date.now() - voiceStart.current) / 1000));
        setVoice({ step, durationSec: dur, text: heard.current });
      }
    };
    try {
      r.start();
      rec.current = r;
      voiceStart.current = Date.now();
      setListening(true);
    } catch {
      setMsg("말로 입력을 시작하지 못했어요. 키보드로 입력해 주세요.");
    }
  };

  const go = (skip: boolean) => {
    stopListening();
    const a = skip ? answers : answers;
    persist(a);
    setMsg(null);
    if (step < 3) {
      setStep(step + 1);
      window.scrollTo({ top: 0 });
    } else if (hasContent({ answers: a, photos, audios, voice, updatedAt: 0 })) {
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
    const next = [...photos, ...added];
    setPhotos(next);
    persist(answers, next);
  };
  const removePhoto = (ref: string) => {
    const next = photos.filter((p) => p !== ref);
    setPhotos(next);
    persist(answers, next);
    deleteMedia([ref]);
  };
  const clip = audios.find((a) => a.step === step);
  const saveClip = (c: AudioClip) => {
    if (clip) deleteMedia([clip.id]);
    const next = [...audios.filter((a) => a.step !== c.step), c];
    setAudios(next);
    persist(answers, photos, next);
  };
  const deleteClip = () => {
    if (!clip) return;
    const next = audios.filter((a) => a !== clip);
    setAudios(next);
    persist(answers, photos, next);
    deleteMedia([clip.id]);
  };

  if (!cat || !q) return null;
  const c = cardColors(cat);

  if (done) {
    const first = answers.find((a) => a.trim()) ?? voice?.text ?? "";
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
            className="flex h-14 w-full items-center justify-center rounded-full border-[1.5px] border-ink text-[1rem] font-semibold"
          >
            {cat.name} 더 기록하기
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="category-list flex min-h-app flex-col px-6 pb-[calc(6rem+16px+env(safe-area-inset-bottom))]" style={catVars(cat.id)}>
      <div className="flex h-16 items-center justify-between">
        <button
          type="button"
          onClick={() => {
            stopListening();
            persist();
            navigate({ to: "/cat/$catId", params: { catId: cat.id } });
          }}
          aria-label="뒤로"
          disabled={recBusy}
          className="-ml-3 flex size-12 items-center justify-center rounded-full"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
            <path d="m15 5-7 7 7 7" />
          </svg>
        </button>
        <CategoryPill cat={cat} />
      </div>

      <div className="flex gap-1.5" role="progressbar" aria-valuemin={1} aria-valuemax={4} aria-valuenow={step + 1} aria-label="진행">
        {steps.map((_, i) => (
          <span key={i} className="h-1 flex-1 rounded-full transition-colors" style={{ background: i <= step ? c.pill : "color-mix(in srgb, var(--cat-pill) 30%, transparent)" }} />
        ))}
      </div>

      <p className="mt-5 text-[0.875rem] font-medium">
        {step === 0 ? "핵심 질문" : `이어지는 질문 ${step}/3`}
      </p>
      <h1 className="mt-2 font-serif text-[1.625rem] leading-[1.45]">{steps[step]}</h1>
      {step > 0 && <p className="mt-2 text-[0.9375rem]">{q.core}</p>}

      <label className="sr-only" htmlFor="answer">답변</label>
      <textarea
        id="answer"
        value={answers[step]}
        onChange={(e) => setAnswers(answers.map((a, i) => (i === step ? e.target.value : a)))}
        placeholder="쓰거나 말로 남기세요."
        className="mt-4 min-h-[3.5rem] max-h-[14rem] flex-[1_1_0] w-full resize-none rounded-3xl border-0 bg-card p-5 text-[1.0625rem] leading-[1.7] outline-none placeholder:text-inherit placeholder:opacity-100 focus-visible:ring-2 focus-visible:ring-(--cat-pill)"
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
                className="absolute right-2 top-2 h-12 rounded-full bg-card px-4 text-[0.9375rem] font-medium"
              >
                사진 빼기
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-3 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={listening ? stopListening : startListening}
          aria-pressed={listening}
          disabled={recBusy}
          className={`flex h-14 items-center justify-center gap-2 rounded-full text-[1rem] font-medium disabled:opacity-40 ${
            listening ? "bg-(--cat-pill-text) text-(--cat-pill)" : "bg-card"
          }`}
        >
          {listening && <span className="size-2.5 animate-pulse rounded-full bg-destructive" aria-hidden />}
          {listening ? "듣는 중 · 멈추기" : "말로 하기"}
        </button>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="h-14 rounded-full bg-card text-[1rem] font-medium"
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
      <VoiceRecorder
        key={step}
        step={step}
        clip={clip}
        disabled={listening}
        onBusy={setRecBusy}
        onSave={saveClip}
        onDelete={deleteClip}
        onMessage={setMsg}
      />

      {msg && (
        <p role="status" className="mt-4 rounded-2xl bg-muted px-4 py-3 text-[0.9375rem] leading-[1.6]">
          {msg}
        </p>
      )}

      <div className="mt-auto space-y-2 pt-4">
        {recBusy && <p className="text-center text-[0.9375rem]">녹음을 마친 뒤 다음으로 넘어갈 수 있어요.</p>}
        <button
          type="button"
          onClick={() => go(false)}
          disabled={recBusy}
          className="h-14 disabled:opacity-40 w-full rounded-full bg-(--cat-pill-text) text-[1rem] font-semibold text-(--cat-pill)"
        >
          {step < 3 ? "다음" : "기록 마치기"}
        </button>
        <button type="button" onClick={() => go(true)} disabled={recBusy} className="disabled:opacity-40 h-12 w-full rounded-full text-[1rem]">
          다음에 답할게요
        </button>
      </div>
    </main>
  );
}
