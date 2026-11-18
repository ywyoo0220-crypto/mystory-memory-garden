import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";
import wordmark from "@/assets/mystory_wordmark.png.asset.json";
import { cardColors, getCategory, type Category } from "@/lib/data";
import { actions, useStore } from "@/lib/store";
import { prefs, usePrefs, validBirth } from "@/lib/prefs";
import { catVars } from "@/lib/theme";
import { CategoryPill } from "@/components/CategoryCard";
import { Button } from "@/components/ui/button";
import { canSaveOnboardingProfile, finishOnb, onbLog } from "@/lib/onboarding";

const TITLE = "처음 안내 — MyStory";
const DESC = "질문에 답하며 기록하는 방법을 알아봐요.";

export const Route = createFileRoute("/onboarding/$n")({
  beforeLoad: ({ params }) => {
    if (!["1", "2", "3", "4", "5"].includes(params.n)) throw notFound();
  },
  head: ({ params }) => ({
    meta: [
      { title: `${TITLE} ${params.n}/5` },
      { name: "description", content: DESC },
      { property: "og:title", content: `${TITLE} ${params.n}/5` },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Onboarding,
});

const FIRST_QID = "A1-Q2";
const BIG_NOTE = "글자 크기는 홈이나 MY에서 바꿀 수 있어요.";
const primary = "flex h-14 w-full items-center justify-center rounded-full bg-ink text-body font-medium text-ink-foreground";
const ghost = "flex h-12 w-full items-center justify-center rounded-full text-body font-medium";

function Onboarding() {
  const { n } = Route.useParams();
  const step = Number(n);
  const navigate = useNavigate();
  const { textSize } = useStore();
  const content = useRef<HTMLDivElement>(null);
  useEffect(() => {
    onbLog(`onb_view_${step}`);
    content.current?.scrollTo({ top: 0 });
  }, [step]);

  const go = (k: number) => navigate({ to: "/onboarding/$n", params: { n: String(k) } });
  const skip = () => {
    onbLog(`onb_skip_${step}`);
    finishOnb();
    navigate({ to: "/", replace: true });
  };
  const big = textSize > 0;
  const toggleBig = () => {
    if (!big) onbLog("onb_big_on");
    actions.toggleLarge();
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
    4: null,
    5: <Screen5 />,
  } as Record<number, ReactNode>;

  return (
    <main className="fixed inset-0 mx-auto flex w-full max-w-[440px] flex-col bg-paper pt-safe">
      <div className="flex min-h-16 shrink-0 flex-wrap items-center justify-between gap-2 px-2">
        {step === 1 ? (
          <img src={wordmark.url} alt="MyStory" width={1979} height={483} className="ml-4 h-[1.625rem] w-auto" />
        ) : (
          <Button asChild variant="palette" className="size-12 rounded-full p-0"><Link to="/onboarding/$n" params={{ n: String(step - 1) }} aria-label="뒤로">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden><path d="m15 5-7 7 7 7" /></svg>
          </Link></Button>
        )}
        <div className="flex items-center gap-1">
          {step === 1 && (
            <Button variant="palette"
              type="button"
              aria-pressed={big}
              onClick={toggleBig}
              className={`h-12 whitespace-nowrap rounded-full border border-ink px-4 text-caption font-medium ${big ? "bg-ink text-ink-foreground" : ""}`}
            >
              글자 크게
            </Button>
          )}
          {step < 5 && (
            <Button variant="palette" type="button" onClick={skip} className="h-12 whitespace-nowrap px-4 text-caption font-medium">안내 건너뛰기</Button>
          )}
        </div>
      </div>

      <p className="shrink-0 px-6 pb-2 pt-2 text-caption font-medium text-ink">{EYEBROW[step]}</p>
      {step === 4 ? (
        <Screen4 onNext={() => go(5)} />
      ) : (
        <>
          <div ref={content} className="min-h-0 flex-1 overflow-y-auto px-6 pb-6 pt-2">{screen[step]}</div>
          <Footer>
            {step === 5 ? (
              <>
                <Button variant="palette" type="button" className={primary} onClick={tour}>첫 질문에 답하기</Button>
              </>
            ) : (
              <Button asChild variant="palette" className={primary}><Link to="/onboarding/$n" params={{ n: String(step + 1) }}>{step === 3 ? "내 정보로 넘어가기" : "다음"}</Link></Button>
            )}
          </Footer>
        </>
      )}
    </main>
  );
}

function Footer({ children }: { children: ReactNode }) {
  return (
    <div className="z-20 shrink-0 space-y-2 border-t border-comparison-border bg-paper px-6 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-4">
      {children}
    </div>
  );
}

const EYEBROW: Record<number, string> = { 1: "사용 안내 1/3", 2: "사용 안내 2/3", 3: "사용 안내 3/3", 4: "내 정보 넣기 · 선택", 5: "이제 시작해요" };

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

function Screen4({ onNext }: { onNext: () => void }) {
  const { profile } = usePrefs();
  const [name, setName] = useState("");
  const [birth, setBirth] = useState("");
  const [birthTouched, setBirthTouched] = useState(false);
  const birthInput = useRef<HTMLInputElement>(null);
  useEffect(() => {
    setName((v) => v || profile.name);
    setBirth((v) => v || profile.birth);
  }, [profile.name, profile.birth]);
  const save = () => {
    if (!canSaveOnboardingProfile(name, birth)) return;
    if (!prefs.setProfile({ ...profile, name: name.trim(), birth })) return void toast("저장하지 못했어요. 다시 시도하거나 나중에 해 주세요.");
    onNext();
  };
  const input = "mt-2 h-14 w-full rounded-2xl border border-comparison-border bg-card px-4 text-body outline-none focus:border-ink";
  const invalidBirth = birthTouched && Boolean(birth) && !validBirth(birth);
  return (
    <>
      <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-6 pt-2">
        <Head step={4} title={"이름과 태어난 해를\n넣어 볼까요?"} sub="태어난 해를 넣으면 ‘20대 · 1975–1984’처럼 시기별 연도가 함께 표시돼요. 나중에 MY에서 해도 돼요." />
        <form id="onb-profile" className="mt-6 space-y-6" onSubmit={(e) => { e.preventDefault(); save(); }}>
          <label className="block">
            <span className="text-caption font-medium">이름</span>
            <input className={input} value={name} onChange={(e) => setName(e.target.value)} placeholder="예: 김정희" autoComplete="name" enterKeyHint="next" onKeyDown={(e) => { if (e.key === "Enter" && !e.nativeEvent.isComposing) { e.preventDefault(); birthInput.current?.focus(); } }} />
          </label>
          <label className="block">
            <span className="text-caption font-medium">태어난 해</span>
            <input ref={birthInput} className={input} value={birth} onChange={(e) => setBirth(e.target.value.replace(/\D/g, "").slice(0, 4))} onBlur={() => setBirthTouched(true)} aria-invalid={invalidBirth} aria-describedby={invalidBirth ? "birth-error" : undefined} placeholder="예: 1955" inputMode="numeric" maxLength={4} enterKeyHint="done" />
            {invalidBirth && <span id="birth-error" className="mt-2 block text-caption text-destructive">태어난 해를 네 자리로 확인해 주세요.</span>}
          </label>
        </form>
      </div>
      <Footer>
        <Button variant="palette" type="submit" form="onb-profile" className={`${primary} disabled:opacity-30`} disabled={!canSaveOnboardingProfile(name, birth)}>저장하고 계속</Button>
        <Button variant="palette" type="button" className={ghost} onClick={onNext}>나중에 하기</Button>
      </Footer>
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
      <p className="mt-4 text-body text-muted-foreground">{BIG_NOTE}</p>
    </>
  );
}
