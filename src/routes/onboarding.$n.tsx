import { createFileRoute, notFound, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";
import wordmark from "@/assets/mystory_wordmark.png.asset.json";
import { allCategories, cardColors, getCategory, type Category } from "@/lib/data";
import { actions, hasContent, useStore } from "@/lib/store";
import { prefs, usePrefs, validBirth } from "@/lib/prefs";
import { catVars } from "@/lib/theme";
import { CategoryPill } from "@/components/CategoryCard";
import { finishOnb, onbLog } from "@/lib/onboarding";

const TITLE = "처음 안내 — myStory";
const DESC = "질문에 답하며 기록하는 방법을 알아봐요.";

export const Route = createFileRoute("/onboarding/$n")({
  beforeLoad: ({ params }) => {
    if (!["1", "2", "3", "4", "5"].includes(params.n)) throw notFound();
  },
  head: ({ params }) => ({
    meta: [
      { title: `${TITLE} ${params.n}/5` },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Onboarding,
});

const FIRST_QID = "A1-Q2";
const BIG_NOTE = "글자는 화면 아래 ‘크게’ 버튼으로 언제든 바꿀 수 있어요.";
const primary = "flex h-14 w-full items-center justify-center rounded-full bg-ink text-[1.0625rem] font-medium text-ink-foreground";
const ghost = "flex h-12 w-full items-center justify-center rounded-full text-[1rem] font-medium";

function Onboarding() {
  const { n } = Route.useParams();
  const step = Number(n);
  const navigate = useNavigate();
  const { textSize, records } = useStore();
  useEffect(() => onbLog(`onb_view_${step}`), [step]);

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

  const startFirst = () => {
    onbLog("onb_first_start");
    finishOnb();
    let qid = FIRST_QID;
    if (hasContent(records[qid])) {
      qid = allCategories.flatMap((c) => c.questions).find((q) => !hasContent(records[q.id]))?.id ?? FIRST_QID;
    }
    navigate({ to: "/answer/$qid", params: { qid }, search: { step: 0 }, replace: true });
  };
  const tour = () => {
    onbLog("onb_tour");
    finishOnb();
    navigate({ to: "/", replace: true });
  };

  const screen = {
    1: <Screen1 big={big} />,
    2: <Screen2 />,
    3: <Screen3 />,
    4: null,
    5: <Screen5 />,
  } as Record<number, ReactNode>;

  return (
    <main className="flex min-h-app flex-col">
      <div className="flex h-16 items-center justify-between gap-2 px-2">
        {step === 1 ? (
          <img src={wordmark.url} alt="myStory" width={1979} height={483} className="ml-4 h-[1.625rem] w-auto" />
        ) : (
          <button type="button" aria-label="뒤로" onClick={() => go(step - 1)} className="flex size-12 items-center justify-center rounded-full">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden><path d="m15 5-7 7 7 7" /></svg>
          </button>
        )}
        <div className="flex items-center gap-1">
          {step === 1 && (
            <button
              type="button"
              aria-pressed={big}
              onClick={toggleBig}
              className={`h-11 whitespace-nowrap rounded-full border border-ink px-3 text-[0.9375rem] font-medium ${big ? "bg-ink text-ink-foreground" : ""}`}
            >
              글자 크게
            </button>
          )}
          {step < 5 && (
            <button type="button" onClick={skip} className="h-12 px-3 text-[0.9375rem] font-medium">건너뛰기</button>
          )}
        </div>
      </div>

      {step === 4 ? (
        <Screen4 onNext={() => go(5)} dots={<Dots step={step} />} />
      ) : (
        <>
          <div className="flex-1 px-6 pt-2">{screen[step]}</div>
          <Footer dots={<Dots step={step} />}>
            {step === 5 ? (
              <>
                <button type="button" className={primary} onClick={startFirst}>첫 질문 시작하기</button>
                <button type="button" className={ghost} onClick={tour}>예시 기록 먼저 둘러보기</button>
              </>
            ) : (
              <button type="button" className={primary} onClick={() => go(step + 1)}>{step === 1 ? "시작하기" : "다음"}</button>
            )}
          </Footer>
        </>
      )}
    </main>
  );
}

function Footer({ dots, children }: { dots: ReactNode; children: ReactNode }) {
  return (
    <div className="sticky bottom-0 mt-2 space-y-2 bg-gradient-to-t from-paper from-70% to-transparent px-6 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-6">
      {dots}
      {children}
    </div>
  );
}

function Dots({ step }: { step: number }) {
  return (
    <div className="flex justify-center gap-1.5 pb-3" role="img" aria-label={`5단계 중 ${step}단계`}>
      {[1, 2, 3, 4, 5].map((k) => (
        <span key={k} className={`h-2 rounded-full transition-all ${k === step ? "w-[22px] bg-ink" : "w-2 bg-[#8E8E93]"}`} />
      ))}
    </div>
  );
}

function Head({ title, sub }: { title: string; sub: string }) {
  return (
    <>
      <h2 className="whitespace-pre-line text-[1.9rem] font-medium leading-[1.38] tracking-[-0.03em] [text-wrap:balance]">{title}</h2>
      <p className="mt-3 text-[1.05rem] leading-[1.7] text-muted-foreground">{sub}</p>
    </>
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

function Screen1({ big }: { big: boolean }) {
  const cat = getCategory("A1")!;
  const c = cardColors(cat);
  const q = cat.questions.find((x) => x.id === FIRST_QID)!;
  const steps = [q.core, ...q.followUps];
  return (
    <>
      <Head title={"질문에 답하다 보면\n기억이 이어져요."} sub="큰 질문으로 시작해서, 이어지는 질문을 따라 기억을 하나씩 떠올려요." />
      <Surface cat={cat} className="mt-4 !pt-5 pb-5">
        <CategoryPill cat={cat} />
        <div className="mt-3.5 flex gap-1.5" aria-hidden>
          {DELAYS.map((d, i) => (
            <span key={i} className="onb-fill h-1 flex-1 rounded-full" style={{ background: c.pill, animationDelay: `${d}s` }} />
          ))}
        </div>
        <ol className="mt-3.5 space-y-2">
          {steps.map((s, i) => (
            <li key={i} className={`onb-rise ${i === 0 ? "text-[1.375rem] font-medium leading-[1.4]" : "text-[1rem] leading-[1.5]"}`} style={{ animationDelay: `${DELAYS[i]}s` }}>
              {s}
            </li>
          ))}
        </ol>
      </Surface>
      {big && <p className="mt-4 text-[1rem] leading-[1.6] text-muted-foreground">{BIG_NOTE}</p>}
    </>
  );
}

function Screen2() {
  return (
    <>
      <Head title={"쓰고, 말하고,\n사진도 넣어요."} sub="말하면 글로 바뀌고, 목소리도 함께 남아요. 편한 방법을 골라 남기면 돼요." />
      <div aria-hidden className="pointer-events-none mt-6 select-none" inert>
        <div className="min-h-[9rem] w-full rounded-3xl border border-border bg-card p-5 text-[1.0625rem] leading-[1.7]">여기에 쓰기</div>
        <p className="mt-3 text-center text-[0.9375rem] text-muted-foreground">적는 내용은 이 기기에 바로 저장돼요.</p>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <span className="flex h-14 items-center justify-center rounded-full border border-border bg-card text-[1rem] font-medium">말로 하기</span>
          <span className="flex h-14 items-center justify-center rounded-full border border-border bg-card text-[1rem] font-medium">사진 넣기</span>
        </div>
      </div>
    </>
  );
}

function Screen3() {
  const cats = ["T7", "T8", "T1"].map((id) => getCategory(id)!);
  return (
    <>
      <Head title={"주제별로도, 시간순으로도\n모아 볼 수 있어요."} sub="기록은 이 휴대폰에 저장돼요. 보여줄 사람은 내가 정해요." />
      <div aria-hidden inert className="pointer-events-none mt-4">
        {cats.map((cat, i) => {
          const c = cardColors(cat);
          const last = i === cats.length - 1;
          return (
            <div key={cat.id} className="relative" style={{ zIndex: i + 1, marginTop: i ? "-2rem" : 0 }}>
              <Surface
                cat={cat}
                className={`!pt-5 ${last ? "pb-5" : "rounded-b-none pb-[2.5rem]"}`}
                style={{ boxShadow: i ? `inset 0 1px 0 0 color-mix(in srgb, ${c.count} 40%, transparent)` : undefined }}
              >
                <CategoryPill cat={cat} />
                <p className="mt-3 text-[1.0625rem] font-medium leading-[1.4]">{cat.questions[0]?.core}</p>
              </Surface>
            </div>
          );
        })}
      </div>
    </>
  );
}

function Screen4({ onNext, dots }: { onNext: () => void; dots: ReactNode }) {
  const { profile } = usePrefs();
  const [name, setName] = useState("");
  const [birth, setBirth] = useState("");
  useEffect(() => {
    setName((v) => v || profile.name);
    setBirth((v) => v || profile.birth);
  }, [profile.name, profile.birth]);
  const save = () => {
    if (birth && !validBirth(birth)) return void toast("태어난 해를 네 자리로 입력하세요");
    if (name.trim() || birth) prefs.setProfile({ ...profile, name: name.trim(), birth });
    onNext();
  };
  const input = "mt-2 h-14 w-full rounded-2xl border border-[#D1D1D6] bg-card px-4 text-[1.0625rem] outline-none focus:border-ink";
  return (
    <>
      <div className="flex-1 px-6 pt-2">
        <Head title={"이름과 태어난 해를\n넣어 볼까요?"} sub="태어난 해를 넣으면 ‘20대 · 1975–1984’처럼 시기별 연도가 함께 표시돼요. 나중에 MY에서 해도 돼요." />
        <div className="mt-6 space-y-5">
          <label className="block">
            <span className="text-[0.9375rem] font-medium">이름</span>
            <input className={input} value={name} onChange={(e) => setName(e.target.value)} placeholder="예: 김순자" autoComplete="name" />
          </label>
          <label className="block">
            <span className="text-[0.9375rem] font-medium">태어난 해</span>
            <input className={input} value={birth} onChange={(e) => setBirth(e.target.value.replace(/\D/g, "").slice(0, 4))} placeholder="예: 1955" inputMode="numeric" maxLength={4} />
          </label>
        </div>
      </div>
      <Footer dots={dots}>
        <button type="button" className={primary} onClick={save}>저장하고 계속</button>
        <button type="button" className={ghost} onClick={onNext}>나중에 하기</button>
      </Footer>
    </>
  );
}

function Screen5() {
  const cat = getCategory("A1")!;
  const q = cat.questions.find((x) => x.id === FIRST_QID)!;
  return (
    <>
      <Head title={"첫 질문으로\n시작해요."} sub="답이 짧아도 돼요. 떠오르는 대로 남기면 돼요." />
      <Surface cat={cat} className="mt-6 pb-8">
        <CategoryPill cat={cat} />
        <p className="mt-5 text-[1.5rem] font-medium leading-[1.4]">{q.core}</p>
      </Surface>
      <p className="mt-4 text-[1rem] leading-[1.6] text-muted-foreground">{BIG_NOTE}</p>
    </>
  );
}
