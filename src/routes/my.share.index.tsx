import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { cardColors, categoryOfQuestion, getQuestion } from "@/lib/data";
import { hasContent, useStore } from "@/lib/store";
import { prefs, SCOPES, usePrefs, type ShareScope } from "@/lib/prefs";
import { catVars } from "@/lib/theme";
import { Card, Chevron, Dot, SubHeader, Toggle } from "@/components/my/ui";

export const Route = createFileRoute("/my/share/")({
  head: () => ({
    meta: [
      { title: "기록 공유하기 — myStory" },
      { name: "description", content: "보여줄 기록과 사람을 직접 골라요." },
      { property: "og:title", content: "기록 공유하기 — myStory" },
      { property: "og:description", content: "보여줄 기록과 사람을 직접 골라요." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SharePage,
});

const STEPS = ["기록 고르기", "보여줄 사람", "미리보기"];

function SharePage() {
  const { records } = useStore();
  const { shares } = usePrefs();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [picked, setPicked] = useState<string[]>([]);
  const [scope, setScope] = useState<ShareScope>("family");
  const [noVoice, setNoVoice] = useState(true);
  const list = Object.entries(records).filter(([, r]) => hasContent(r)).sort((a, b) => b[1].updatedAt - a[1].updatedAt);
  const hasVoice = picked.some((q) => records[q]?.voices?.length);
  const sharedN = new Set(shares.flatMap((s) => s.qids)).size;
  const primary = "flex h-14 w-full items-center justify-center rounded-full bg-ink text-[1.0625rem] font-semibold text-ink-foreground disabled:opacity-40";

  const submit = async () => {
    const id = Date.now().toString(36);
    const link = scope === "link" ? `https://mystory-memory-garden.lovable.app/s/${id}` : undefined;
    prefs.addShare({ id, qids: picked, scope, withVoice: scope === "me" || !noVoice, t: Date.now(), link });
    if (link) {
      try {
        await navigator.clipboard.writeText(link);
        toast("링크를 복사했어요");
      } catch {
        toast(`링크: ${link}`);
      }
    } else toast(scope === "me" ? "저장했어요" : "공유했어요");
    navigate({ to: "/my/share/manage" });
  };

  return (
    <main className="pb-6">
      <SubHeader title="기록 공유하기" />
      <div className="space-y-4 px-4">
        {sharedN > 0 && (
          <Link to="/my/share/manage" className="flex min-h-14 items-center gap-3 rounded-[20px] border border-border bg-card px-5">
            <span className="flex-1 text-[1rem] font-medium">공유 관리 · {sharedN}개 공유 중</span>
            <Chevron />
          </Link>
        )}
        <ol className="flex gap-2" aria-label="단계">
          {STEPS.map((s, i) => (
            <li key={s} className="flex-1" aria-current={i === step ? "step" : undefined}>
              <span className={`block h-1 rounded-full ${i <= step ? "bg-ink" : "bg-[#D1D1D6]"}`} />
              <span className={`mt-2 block text-[0.8125rem] ${i === step ? "font-bold" : "text-muted-foreground"}`}>{i + 1}. {s}</span>
            </li>
          ))}
        </ol>

        {step === 0 && (
          <>
            {list.length === 0 && <p className="py-8 text-center text-muted-foreground">아직 공유할 기록이 없어요.</p>}
            <Card className="divide-y overflow-hidden">
              {list.map(([q]) => {
                const cat = categoryOfQuestion(q);
                const on = picked.includes(q);
                return (
                  <label key={q} className="flex min-h-16 cursor-pointer items-center gap-3 px-5 py-3">
                    <input type="checkbox" className="size-5 shrink-0 accent-[#1A1918]" checked={on} onChange={() => setPicked(on ? picked.filter((x) => x !== q) : [...picked, q])} />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2 text-[0.8125rem] text-muted-foreground">
                        {cat && <Dot catId={cat.id} />}
                        {cat?.name}
                      </span>
                      <span className="block text-[1rem] leading-[1.5]">{getQuestion(q)?.core}</span>
                    </span>
                  </label>
                );
              })}
            </Card>
            <button type="button" className={primary} disabled={!picked.length} onClick={() => setStep(1)}>
              {picked.length}개 고르고 다음
            </button>
          </>
        )}

        {step === 1 && (
          <>
            <div role="radiogroup" aria-label="보여줄 사람" className="space-y-2">
              {SCOPES.map(([v, t, d]) => (
                <button
                  key={v}
                  type="button"
                  role="radio"
                  aria-checked={scope === v}
                  onClick={() => { setScope(v); setNoVoice(v !== "me"); }}
                  className={`flex min-h-16 w-full items-center gap-3 rounded-[20px] border bg-card px-5 py-4 text-left ${scope === v ? "border-ink border-2" : "border-border"}`}
                >
                  <span className={`flex size-5 shrink-0 items-center justify-center rounded-full border-2 border-ink`}>
                    {scope === v && <span className="size-2.5 rounded-full bg-ink" />}
                  </span>
                  <span>
                    <span className="block text-[1.0625rem] font-medium">{t}</span>
                    <span className="block text-[0.875rem] text-muted-foreground">{d}</span>
                  </span>
                </button>
              ))}
            </div>
            <p className="text-[0.9375rem] text-muted-foreground">공유한 뒤에도 공유 관리에서 언제든 해제할 수 있어요.</p>
            <div className="flex gap-2">
              <button type="button" className="h-14 rounded-full border border-ink px-6 text-[1rem] font-medium" onClick={() => setStep(0)}>이전</button>
              <button type="button" className={primary} onClick={() => setStep(2)}>다음</button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <p className="text-[0.9375rem]">
              공개 범위: <b>{SCOPES.find((s) => s[0] === scope)?.[1]}</b>
            </p>
            {hasVoice && (
              <Card className="flex items-center gap-3 px-5 py-2">
                <span className="flex-1">
                  <span className="block text-[1rem] font-medium">{scope === "me" || !noVoice ? "목소리 포함" : "목소리는 글로만 보내요"}</span>
                  {scope !== "me" && <span className="block text-[0.875rem] text-muted-foreground">목소리는 빼고 보내기</span>}
                </span>
                {scope !== "me" && <Toggle on={noVoice} onChange={setNoVoice} label="목소리는 빼고 보내기" />}
              </Card>
            )}
            <div className="space-y-2">
              {picked.map((q) => {
                const cat = categoryOfQuestion(q);
                if (!cat) return null;
                const c = cardColors(cat);
                const r = records[q];
                const voice = !!r?.voices?.length;
                return (
                  <div key={q} className="rounded-[20px] p-5" style={{ ...catVars(cat.id), background: c.bg, color: c.fg }}>
                    <p className="text-[0.8125rem] font-medium">
                      {cat.name}
                      {voice && (scope === "me" || !noVoice ? " · 목소리 포함" : " · 목소리는 글로만")}
                    </p>
                    <p className="mt-1 text-[1.0625rem] font-bold leading-[1.5]">{getQuestion(q)?.core}</p>
                    <p className="mt-2 line-clamp-2 text-[0.9375rem] leading-[1.6]">{r?.answers.find((a) => a.trim()) || r?.voices?.[0]?.text}</p>
                  </div>
                );
              })}
            </div>
            <div className="flex gap-2">
              <button type="button" className="h-14 rounded-full border border-ink px-6 text-[1rem] font-medium" onClick={() => setStep(1)}>이전</button>
              <button type="button" className={primary} onClick={() => void submit()}>{scope === "me" ? "저장하기" : "공유하기"}</button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
