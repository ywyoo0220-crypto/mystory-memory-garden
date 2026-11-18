import { createFileRoute, Link, notFound, redirect, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState, type ReactNode } from "react";
import wordmark from "@/assets/mystory_wordmark.png.asset.json";
import { cardColors, getCategory, type Category } from "@/lib/data";
import { catVars } from "@/lib/theme";
import { CategoryPill } from "@/components/CategoryCard";
import { Button } from "@/components/ui/button";
import { TextSizeButton } from "@/components/TextSizeButton";
import { actions, useStore } from "@/lib/store";
import { finishOnb, nextOnboardingStep, onboardingStep, onbLog, previousOnboardingStep } from "@/lib/onboarding";

const TITLE = "처음 안내 — MyStory";
const DESC = "질문에 답하며 기록하는 방법을 알아봐요.";

export const Route = createFileRoute("/onboarding/$n")({
  validateSearch: (search: Record<string, unknown>): { mode?: "help" } => search["mode"] === "help" ? { mode: "help" } : {},
  beforeLoad: ({ params, search }) => {
    if (!["1", "2", "3", "4", "5"].includes(params.n)) throw notFound();
    const step = onboardingStep(Number(params.n), search.mode ?? "first");
    if (step !== Number(params.n)) throw redirect({ to: "/onboarding/$n", params: { n: String(step) }, search, replace: true });
  },
  head: ({ params }) => ({
    meta: [
      { title: `${TITLE} — ${params.n === "5" ? "첫 질문 시작" : `사용 안내 ${params.n}/3`}` },
      { name: "description", content: DESC },
      { property: "og:title", content: `${TITLE} — ${params.n === "5" ? "첫 질문 시작" : `사용 안내 ${params.n}/3`}` },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Onboarding,
});

const FIRST_QID = "A1-Q2";
const primary = "flex h-14 w-full items-center justify-center rounded-full bg-ink text-body font-medium text-ink-foreground";

function Onboarding() {
  const { n } = Route.useParams();
  const search = Route.useSearch();
  const mode = search.mode ?? "first";
  const step = Number(n);
  const previous = previousOnboardingStep(step, mode);
  const next = nextOnboardingStep(step, mode);
  const navigate = useNavigate();
  const content = useRef<HTMLDivElement>(null);
  useEffect(() => {
    onbLog(`onb_view_${step}`);
    content.current?.scrollTo({ top: 0 });
  }, [step]);

  const skip = () => {
    onbLog(`onb_skip_${step}`);
    finishOnb();
    navigate({ to: "/", replace: true });
  };

  /** The last screen shows the first question, so "시작하기" opens that question rather than the empty home. */
  const tour = () => {
    onbLog("onb_tour");
    finishOnb();
    try { sessionStorage.setItem("mystory.tour.v1", FIRST_QID); } catch { /* noop */ }
    navigate({ to: "/answer/$qid", params: { qid: FIRST_QID }, replace: true });
  };

  const screen = {
    1: <Screen1 />,
    2: <Screen2 />,
    3: <Screen3 />,
    5: <Screen5 />,
  } as Record<number, ReactNode>;

  return (
    <main className="fixed inset-0 mx-auto flex w-full max-w-[440px] flex-col bg-paper pt-safe">
      <div className="flex min-h-16 shrink-0 flex-wrap items-center justify-between gap-2 px-2">
        {step === 1 ? (
          <img src={wordmark.url} alt="MyStory" width={1979} height={483} className="ml-4 h-[1.625rem] w-auto" />
        ) : (
          <Button asChild variant="palette" className="size-12 rounded-full p-0"><Link to="/onboarding/$n" params={{ n: String(previous ?? 1) }} search={search} aria-label="뒤로">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden><path d="m15 5-7 7 7 7" /></svg>
          </Link></Button>
        )}
        <div className="flex items-center gap-1">
          {mode === "help" ? (
            <Button asChild variant="palette" className="size-12 rounded-full p-0"><Link to="/help" aria-label="닫기">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden><path d="M6 6l12 12M18 6 6 18" /></svg>
            </Link></Button>
          ) : step < 5 && (
            <Button variant="palette" type="button" onClick={skip} className="h-12 whitespace-nowrap px-4 text-caption font-medium">안내 건너뛰기</Button>
          )}
        </div>
      </div>

      <p className="shrink-0 px-6 pb-2 pt-2 text-caption font-medium text-ink">{EYEBROW[step]}</p>
          <div ref={content} className="min-h-0 flex-1 overflow-y-auto px-6 pb-6 pt-2">{screen[step]}</div>
          <Footer size={step !== 5}>
            {mode === "help" && step === 3 ? (
              <Button asChild variant="palette" className={primary}><Link to="/help">도움말로 돌아가기</Link></Button>
            ) : step === 5 ? (
              <>
                <Button variant="palette" type="button" className={primary} onClick={tour}>첫 질문에 답하기</Button>
              </>
            ) : (
              <Button asChild variant="palette" className={primary}><Link to="/onboarding/$n" params={{ n: String(next ?? step) }} search={search}>{step === 3 ? "시작해 볼까요" : "다음"}</Link></Button>
            )}
          </Footer>
    </main>
  );
}

function Footer({ children, size }: { children: ReactNode; size: boolean }) {
  return (
    <div className="z-20 flex shrink-0 items-center gap-2 border-t border-comparison-border bg-paper px-6 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-4">
      {/* 크게 always sits at the bottom-right: here, at the right end of the bottom button. */}
      <div className="min-w-0 flex-1">{children}</div>
      {size && <TextSizeButton />}
    </div>
  );
}

const EYEBROW: Record<number, string> = { 1: "사용 안내 1/3", 2: "사용 안내 2/3", 3: "사용 안내 3/3", 5: "이제 시작해요" };

function Head({ step, title, sub }: { step: number; title: string; sub: string }) {
  return (
    <>
      <h1 className="whitespace-pre-line text-title font-medium [text-wrap:balance]">{title}</h1>
      <p className="mt-4 text-body text-muted-foreground">{sub}</p>
    </>
  );
}

/** Shared non-interactive "example" frame around onboarding illustrations. */
function Frame({ className = "", children }: { className?: string; children: ReactNode }) {
  return (
    <div aria-hidden inert className={`pointer-events-none select-none rounded-3xl border border-comparison-border bg-paper p-4 ${className}`}>
      {children}
    </div>
  );
}

function Surface({ cat, children, className = "", style }: { cat: Category; children: ReactNode; className?: string; style?: React.CSSProperties }) {
  const c = cardColors(cat);
  return (
    <section className={`category-surface rounded-[32px] px-6 pt-6 ${className}`} style={{ ...catVars(cat.id), background: c.bg, color: c.fg, ...style }}>
      {children}
    </section>
  );
}

const DELAYS = [0.25, 0.95, 1.65, 2.35];

function Screen1() {
  const cat = getCategory("A1");
  if (!cat) return null;
  const c = cardColors(cat);
  const q = cat.questions.find((x) => x.id === FIRST_QID);
  if (!q) return null;
  const steps = [q.core, ...q.followUps.slice(0, 1)];
  return (
    <>
      <Head step={1} title={"질문에 답하다 보면\n기억이 이어져요."} sub="지금은 기록 방법을 둘러보는 중이에요. 먼저 큰 질문에 답하고, 이어지는 질문을 따라 기억을 떠올려요." />
      <Frame className="mt-4"><Surface cat={cat} className="!pt-6 pb-6">
        <CategoryPill cat={cat} />
        <div className="mt-4 flex gap-2" aria-hidden>
          {DELAYS.map((d, i) => (
            <span key={i} className="onb-fill h-1 flex-1 rounded-full" style={{ background: c.pill, animationDelay: `${d}s` }} />
          ))}
        </div>
        <ol className="mt-4 space-y-2">
          {steps.map((s, i) => (
            <li key={i} className={`onb-rise ${i === 0 ? "text-title font-medium" : "text-body"}`} style={{ animationDelay: `${DELAYS[i]}s` }}>
              {s}
            </li>
          ))}
        </ol>
      </Surface></Frame>
    </>
  );
}

function Screen2() {
  return (
    <>
      <Head step={2} title={"쓰고, 말하고,\n사진도 넣어요."} sub="글·목소리·사진으로 남길 수 있어요. 말한 내용을 글로 옮기는 기능은 휴대폰과 브라우저에 따라 달라요." />
      <Frame className="mt-4">
        <div className="w-full rounded-3xl border-[1.5px] border-dashed border-border bg-card p-4">
          <TypingText text="어릴 때 나는 동네에서 장난꾸러기로 통했어" />
        </div>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <span className="flex h-12 items-center justify-center gap-2 rounded-full bg-muted text-caption font-medium">
            <svg className="size-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="9" y="2" width="6" height="12" rx="3" /><path d="M5 10v2a7 7 0 0 0 14 0v-2M12 19v3m-4 0h8" /></svg>
            말로 하기
          </span>
          <span className="flex h-12 items-center justify-center gap-2 rounded-full bg-muted text-caption font-medium">
            <svg className="size-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="m21 15-5-5L5 21" /></svg>
            사진 넣기
          </span>
        </div>
      </Frame>
    </>
  );
}

function TypingText({ text }: { text: string }) {
  const chars = Array.from(text);
  const [n, setN] = useState(0);
  useEffect(() => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return void setN(chars.length);
    let i = 0;
    let t: ReturnType<typeof setTimeout>;
    const tick = () => {
      i += 1;
      setN(i);
      if (i < chars.length) t = setTimeout(tick, 110);
    };
    t = setTimeout(tick, 600);
    return () => clearTimeout(t);
  }, [text]);
  return (
    <p className="mt-1 min-h-[3.6em] text-body text-ink">
      <span>{chars.slice(0, n).join("")}<span aria-hidden className="invisible">{chars.slice(n).join("")}</span></span>
    </p>
  );
}

function Screen3() {
  const cats = ["T7", "T8", "T1"].map((id) => getCategory(id)).filter((cat): cat is Category => Boolean(cat));
  return (
    <>
      <Head step={3} title={"주제별로도, 시간순으로도\n모아 볼 수 있어요."} sub="홈에서 내 기록을 모아 봐요. 같은 주제나 시기의 이야기는 카드 한 장에 쌓이고, 이 휴대폰에만 저장돼요." />
      <Frame className="mt-4">
        {cats.map((cat, i) => {
          const last = i === cats.length - 1;
          return (
            <div key={cat.id} className="onb-stack relative" style={{ zIndex: i + 1, marginTop: i ? "-1.5rem" : 0, animationDelay: `${300 + i * 440}ms` }}>
              <Surface
                cat={cat}
                className={`!pt-6 ${last ? "pb-6" : "pb-[2.5rem]"}`}
              >
                <CategoryPill cat={cat} />
                {last && <p className="mt-4 text-body font-medium">{cat.questions[0]?.core}</p>}
              </Surface>
            </div>
          );
        })}
      </Frame>
    </>
  );
}

function Screen5() {
  const cat = getCategory("A1");
  if (!cat) return null;
  const q = cat.questions.find((x) => x.id === FIRST_QID);
  if (!q) return null;
  return (
    <>
      <Head step={5} title={"첫 질문으로\n시작해요."} sub="사용 안내가 끝났어요. 아래 버튼을 누르면 내 이야기를 직접 남겨요. 답은 짧아도 괜찮아요." />
      <Frame className="mt-6">
        <Surface cat={cat} className="pb-8">
          <CategoryPill cat={cat} />
          <p className="mt-6 text-title font-medium">{q.core}</p>
        </Surface>
      </Frame>
      <SizeChoice />
    </>
  );
}

/** First-run text size choice; applies immediately so the user sees the result before answering. */
function SizeChoice() {
  const { large } = useStore();
  const opt = (on: boolean) => `flex h-12 flex-1 items-center justify-center rounded-full text-body font-medium ${on ? "bg-ink text-ink-foreground" : "bg-muted text-ink"}`;
  return (
    <section className="mt-6" aria-labelledby="size-choice">
      <p id="size-choice" className="text-body font-medium text-ink">어떤 글자 크기로 볼까요?</p>
      <div role="radiogroup" aria-labelledby="size-choice" className="mt-2 flex gap-2">
        <button type="button" role="radio" aria-checked={!large} className={opt(!large)} onClick={() => actions.setTextSize(0)}>보통</button>
        <button type="button" role="radio" aria-checked={large} className={opt(large)} onClick={() => actions.setTextSize(1)}>크게</button>
      </div>
      <p className="mt-2 text-caption text-muted-foreground">나중에 MY &gt; 설정에서도 바꿀 수 있어요.</p>
    </section>
  );
}
