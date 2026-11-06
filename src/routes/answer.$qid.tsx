import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { cardColors, categoryOfQuestion, getQuestion } from "@/lib/data";
import { actions, hasContent, useStore, type StoryRecord } from "@/lib/store";
import { CategoryPill } from "@/components/CategoryCard";

export const Route = createFileRoute("/answer/$qid")({
  beforeLoad: ({ params }) => {
    if (!getQuestion(params.qid)) throw notFound();
  },
  head: () => ({
    meta: [
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

async function resizeImage(file: File): Promise<string> {
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
    canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.8);
  } finally {
    URL.revokeObjectURL(url);
  }
}

function AnswerFlow() {
  const { qid } = Route.useParams();
  const q = getQuestion(qid)!;
  const cat = categoryOfQuestion(qid)!;
  const c = cardColors(cat);
  const steps = [q.core, ...q.followUps];
  const { records } = useStore();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>(["", "", "", ""]);
  const [photo, setPhoto] = useState<string | undefined>();
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
      setPhoto(r.photo);
      setVoice(r.voice);
    } else if (Object.keys(records).length || typeof window !== "undefined") {
      init.current = Object.keys(records).length > 0;
    }
  }, [records, qid]);

  useEffect(() => () => rec.current?.stop(), []);

  const persist = (a = answers, p = photo, v = voice) => {
    const r = { answers: a, photo: p, voice: v };
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
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) finalText += t;
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
    } else if (hasContent({ answers: a, photo, voice, updatedAt: 0 })) {
      setDone(true);
    } else {
      navigate({ to: "/cat/$catId", params: { catId: cat.id } });
    }
  };

  const onPhoto = async (f?: File) => {
    if (!f) return;
    try {
      const d = await resizeImage(f);
      setPhoto(d);
      persist(answers, d);
    } catch {
      setMsg("사진을 불러오지 못했어요.");
    }
  };

  if (done) {
    const first = answers.find((a) => a.trim()) ?? voice?.text ?? "";
    return (
      <main className="px-6 pt-16">
        <p className="text-[1rem] font-medium text-muted-foreground">기록했습니다.</p>
        <h1 className="mt-2 font-serif text-[1.75rem] leading-[1.4]">이야기 하나가 쌓였어요.</h1>
        <article className="mt-8 rounded-[32px] p-6 pb-8" style={{ background: c.bg, color: c.fg }}>
          <CategoryPill cat={cat} />
          <h2 className="mt-5 font-serif text-[1.5rem] leading-[1.4]">{q.core}</h2>
          {photo && <img src={photo} alt="첨부한 사진" className="mt-5 aspect-[16/10] w-full rounded-3xl object-cover" />}
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
    <main className="flex min-h-screen flex-col px-6 pb-8">
      <div className="flex h-16 items-center justify-between">
        <Link
          to="/cat/$catId"
          params={{ catId: cat.id }}
          onClick={() => {
            stopListening();
            persist();
          }}
          aria-label="닫기"
          className="-ml-3 flex size-12 items-center justify-center rounded-full"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
            <path d="M6 6l12 12M18 6 6 18" />
          </svg>
        </Link>
        <CategoryPill cat={cat} />
      </div>

      <div className="flex gap-1.5" role="progressbar" aria-valuemin={1} aria-valuemax={4} aria-valuenow={step + 1} aria-label="진행">
        {steps.map((_, i) => (
          <span key={i} className="h-1 flex-1 rounded-full transition-colors" style={{ background: i <= step ? c.fg : "var(--border)" }} />
        ))}
      </div>

      <p className="mt-8 text-[0.875rem] font-medium text-muted-foreground">
        {step === 0 ? "핵심 질문" : `이어지는 질문 ${step}/3`}
      </p>
      <h1 className="mt-2 font-serif text-[1.625rem] leading-[1.45]">{steps[step]}</h1>
      {step > 0 && <p className="mt-2 text-[0.9375rem] text-muted-foreground">{q.core}</p>}

      <label className="sr-only" htmlFor="answer">답변</label>
      <textarea
        id="answer"
        value={answers[step]}
        onChange={(e) => setAnswers(answers.map((a, i) => (i === step ? e.target.value : a)))}
        placeholder="쓰거나 말로 남기세요."
        rows={6}
        className="mt-6 w-full resize-none rounded-3xl border-0 bg-card p-5 text-[1.0625rem] leading-[1.7] outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
      />

      {photo && step === 0 && (
        <div className="relative mt-3">
          <img src={photo} alt="첨부한 사진" className="aspect-[16/10] w-full rounded-3xl object-cover" />
          <button
            type="button"
            onClick={() => {
              setPhoto(undefined);
              persist(answers, undefined);
            }}
            className="absolute right-3 top-3 h-10 rounded-full bg-card px-4 text-[0.875rem] font-medium"
          >
            사진 빼기
          </button>
        </div>
      )}

      <div className="mt-3 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={listening ? stopListening : startListening}
          aria-pressed={listening}
          className={`flex h-14 items-center justify-center gap-2 rounded-full text-[1rem] font-medium ${
            listening ? "bg-ink text-ink-foreground" : "bg-card"
          }`}
        >
          {listening && <span className="size-2.5 animate-pulse rounded-full bg-destructive" aria-hidden />}
          {listening ? "듣는 중 · 멈추기" : "말로 하기"}
        </button>
        <button
          type="button"
          onClick={() => {
            if (step !== 0) setStep(0);
            fileRef.current?.click();
          }}
          className="h-14 rounded-full bg-card text-[1rem] font-medium"
        >
          {photo ? "사진 바꾸기" : "사진 넣기"}
        </button>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => onPhoto(e.target.files?.[0])} />
      </div>

      {msg && (
        <p role="status" className="mt-4 rounded-2xl bg-muted px-4 py-3 text-[0.9375rem] leading-[1.6]">
          {msg}
        </p>
      )}

      <div className="mt-auto space-y-2 pt-10">
        <button
          type="button"
          onClick={() => go(false)}
          className="h-14 w-full rounded-full bg-ink text-[1rem] font-semibold text-ink-foreground"
        >
          {step < 3 ? "다음" : "기록 마치기"}
        </button>
        <button type="button" onClick={() => go(true)} className="h-12 w-full rounded-full text-[1rem] text-muted-foreground">
          다음에 답할게요
        </button>
        {step > 0 && (
          <button type="button" onClick={() => setStep(step - 1)} className="h-12 w-full rounded-full text-[0.9375rem] text-muted-foreground">
            이전 질문
          </button>
        )}
      </div>
    </main>
  );
}
