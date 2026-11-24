import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useDeviceName } from "@/lib/device";
import { FIRST_QID, finishOnb, onbLog } from "@/lib/onboarding";

const TITLE = "연습하기 — 마이스토리";
const DESC = "저장되지 않는 연습 질문으로 쓰기와 넘기기를 미리 해 봐요.";

export const Route = createFileRoute("/onboarding/practice")({
  validateSearch: (search: Record<string, unknown>): { mode?: "help" } => search["mode"] === "help" ? { mode: "help" } : {},
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Practice,
});

const QUESTIONS = ["오늘 아침에는 무엇을 먹었나요?", "맛은 어땠나요?"];
const VOICE_MSG = "연습에서는 눌러만 볼 수 있어요. 실제 기록에서는 말한 내용이 글로 바뀌고 목소리도 함께 남아요.";
const PHOTO_MSG = "연습에서는 눌러만 볼 수 있어요. 실제 기록에서는 사진을 골라 답과 함께 남길 수 있어요.";
const primary = "h-14 w-full rounded-full bg-ink text-body font-medium text-ink-foreground";
const secondary = "h-14 w-full rounded-full border border-ink text-body font-medium";
const textBtn = "h-12 w-full rounded-full text-body";

function Practice() {
  const { mode } = Route.useSearch();
  const navigate = useNavigate();
  const device = useDeviceName();
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const [answers, setAnswers] = useState(["", ""]);
  const [msg, setMsg] = useState<string | null>(null);

  const advance = () => {
    setMsg(null);
    if (step === 0) setStep(1);
    else setDone(true);
  };
  const back = () => {
    setMsg(null);
    if (step === 1) return setStep(0);
    if (mode === "help") navigate({ to: "/help" });
    else navigate({ to: "/onboarding/$n", params: { n: "5" } });
  };
  const again = () => {
    setAnswers(["", ""]);
    setMsg(null);
    setStep(0);
    setDone(false);
  };
  const tour = () => {
    onbLog("onb_tour");
    finishOnb();
    try { sessionStorage.setItem("mystory.tour.v1", FIRST_QID); } catch { /* noop */ }
    navigate({ to: "/answer/$qid", params: { qid: FIRST_QID }, replace: true });
  };

  if (done) {
    return (
      <main className="fixed inset-0 mx-auto flex w-full max-w-read flex-col bg-paper pt-safe">
        <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-4 pt-12">
          <p className="text-body font-medium">연습을 마쳤어요.</p>
          <h1 className="mt-2 font-serif text-title">이제 실제 질문에 답해 볼까요?</h1>
          <p className="mt-4 text-body text-muted-foreground">연습에서 쓴 내용은 저장되지 않았어요. 실제 기록은 쓰는 대로 이 {device}에 저장되고, 언제든 고칠 수 있어요.</p>
        </div>
        <div className="shrink-0 space-y-2 border-t border-border px-6 pb-[calc(8px+env(safe-area-inset-bottom))] pt-2">
          {mode === "help" ? (
            <>
              <button type="button" className={primary} onClick={() => navigate({ to: "/record" })}>질문 고르러 가기</button>
              <button type="button" className={secondary} onClick={again}>한 번 더 연습하기</button>
              <button type="button" className={textBtn} onClick={() => navigate({ to: "/help" })}>도움말로 돌아가기</button>
            </>
          ) : (
            <>
              <button type="button" className={primary} onClick={tour}>첫 질문에 답하기</button>
              <button type="button" className={secondary} onClick={again}>한 번 더 연습하기</button>
            </>
          )}
        </div>
      </main>
    );
  }

  const value = answers[step] ?? "";
  const wrote = step === 0 && value.length > 0;
  const guide = step === 1
    ? "③ 이어지는 질문이에요. 실제 기록에서는 이런 질문이 세 개 이어져요. 답하기 어려우면 ‘다음에 답할게요’로 넘겨도 돼요."
    : wrote
      ? "② 좋아요. 이제 아래의 ‘다음’을 눌러 보세요."
      : "① 아래 칸을 눌러 한 줄 써 보세요. 틀려도 괜찮아요.";

  return (
    <main className="fixed inset-0 mx-auto flex w-full max-w-read flex-col bg-paper pt-safe">
      <div className="shrink-0 px-6">
        <div className="relative flex h-16 items-center justify-between">
          <button type="button" onClick={back} aria-label="뒤로" className="-ml-4 flex size-12 items-center justify-center rounded-full">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden><path d="m15 5-7 7 7 7" /></svg>
          </button>
          <p className="pointer-events-none absolute inset-x-12 text-center text-body font-medium">연습</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex flex-1 gap-2" role="progressbar" aria-valuemin={1} aria-valuemax={2} aria-valuenow={step + 1} aria-label="진행">
            {QUESTIONS.map((_, i) => (
              <span key={i} className="relative h-1 flex-1 overflow-hidden rounded-full" style={{ background: "var(--border)" }}>
                <span className="ms-seg absolute inset-0 rounded-full" style={{ background: "var(--ink)", transform: `scaleX(${i <= step ? 1 : 0})` }} />
              </span>
            ))}
          </div>
          <span className="text-caption font-medium tabular-nums" aria-hidden>{step + 1} / {QUESTIONS.length}</span>
        </div>
        <p className="mt-4 rounded-2xl bg-ink px-4 py-3 text-caption font-medium text-ink-foreground">연습 중이에요. 여기에 쓴 내용은 저장되지 않아요.</p>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-4">
        <h1 className="mt-6 font-serif text-title">{QUESTIONS[step]}</h1>
        {step > 0 && <p className="mt-2 text-caption">{QUESTIONS[0]}</p>}
        <p role="status" className="mt-4 rounded-2xl border border-ink px-4 py-3 text-body">{guide}</p>
        <label className="sr-only" htmlFor="practice-answer">연습 답변</label>
        <textarea
          id="practice-answer"
          value={value}
          onChange={(e) => { const v = e.target.value; setAnswers((a) => a.map((x, i) => (i === step ? v : x))); }}
          placeholder="한 줄이어도 괜찮아요."
          rows={4}
          className="mt-4 block min-h-[calc(4lh+48px)] w-full resize-none tab:min-h-[calc(6lh+48px)] rounded-3xl border border-border bg-card p-6 text-body outline-none placeholder:text-inherit placeholder:opacity-100 focus-visible:ring-2 focus-visible:ring-(--cat-list-accent)"
        />
        <p className="mt-4 text-center text-caption text-muted-foreground">연습이라 저장되지 않아요.</p>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <button type="button" onClick={() => setMsg(VOICE_MSG)} className="flex min-h-14 flex-wrap items-center justify-center gap-x-3 rounded-full border border-border bg-card px-4 py-2 text-body font-medium">말로 하기</button>
          <button type="button" onClick={() => setMsg(PHOTO_MSG)} className="h-14 rounded-full border border-border bg-card text-body font-medium">사진 넣기</button>
        </div>
        {msg && <p role="status" className="mt-4 rounded-2xl bg-muted px-4 py-2 text-caption">{msg}</p>}
      </div>

      <div className="shrink-0 space-y-2 border-t border-border px-6 pb-[calc(8px+env(safe-area-inset-bottom))] pt-2">
        <button type="button" onClick={advance} className={`${primary} ${wrote ? "outline-[3px] outline-offset-2 outline-ink outline-solid" : ""}`}>다음</button>
        <button type="button" onClick={advance} className={textBtn}>다음에 답할게요</button>
      </div>
    </main>
  );
}
