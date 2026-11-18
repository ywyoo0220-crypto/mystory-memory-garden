import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { cardColors, categoryOfQuestion, getQuestion } from "@/lib/data";
import { hasContent, useStore } from "@/lib/store";
import { prefs, SCOPES, usePrefs, type ShareScope } from "@/lib/prefs";
import { defaultCover, personaCover, shareUrl } from "@/lib/share";
import { CoverPicker } from "@/components/CoverPicker";
import { catVars } from "@/lib/theme";
import { Card, Chevron, Dot, SubHeader, Toggle } from "@/components/my/ui";

export const Route = createFileRoute("/my/share/")({
  head: () => ({
    meta: [
      { title: "기록 공유하기 — MyStory" },
      { name: "description", content: "보여줄 기록과 사람을 직접 골라요." },
      { property: "og:title", content: "기록 공유하기 — MyStory" },
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
  const { shares, profile } = usePrefs();
  const [step, setStep] = useState(0);
  const [picked, setPicked] = useState<string[]>([]);
  const [scope, setScope] = useState<ShareScope>("family");
  /** 'Only me' is not a way of sharing, so the share flow offers only the people to show. */
  const scopes = SCOPES.filter(([v]) => v !== "me");
  const [noVoice, setNoVoice] = useState(true);
  const [cover, setCover] = useState<string | null>(null);
  const list = Object.entries(records).filter(([, r]) => hasContent(r)).sort((a, b) => b[1].updatedAt - a[1].updatedAt);
  const hasVoice = picked.some((q) => records[q]?.voices?.length);
  /** Default cover until the user picks one: the persona's book cover, the example cover, or none. */
  const coverSrc = cover ?? defaultCover(picked, records, profile.name);
  const sharedN = new Set(shares.flatMap((s) => s.qids)).size;
  const primary = "flex h-14 w-full items-center justify-center rounded-full bg-ink text-body font-medium text-ink-foreground disabled:opacity-40";

  const [made, setMade] = useState<string | null>(null);
  const submit = () => {
    const id = Date.now().toString(36);
    prefs.addShare({ id, qids: picked, scope, withVoice: !noVoice, t: Date.now(), link: shareUrl(id), cover: coverSrc || undefined });
    setMade(id);
    window.scrollTo(0, 0);
  };
  const send = async (id: string) => {
    const url = shareUrl(id);
    const title = profile.name.trim() ? `${profile.name.trim()}의 이야기` : "MyStory 이야기";
    try {
      if (navigator.share) return void (await navigator.share({ title, text: "MyStory에서 고른 기록을 보내요.", url }));
      await navigator.clipboard.writeText(url);
      toast("링크를 복사했어요");
    } catch {
      /* closed the share sheet */
    }
  };

  if (made) {
    return (
      <main className="pb-6">
        <SubHeader title="기록 공유하기" />
        <div className="space-y-4 px-6">
          <p className="text-body font-medium">링크를 만들었어요.</p>
          <p className="break-all rounded-2xl border border-border bg-card px-4 py-4 text-caption">{shareUrl(made)}</p>
          <button type="button" className={primary} onClick={() => void send(made)}>카톡 등으로 보내기</button>
          <Link to="/s/$id" params={{ id: made }} className="flex h-14 w-full items-center justify-center rounded-full border border-ink text-body font-medium">
            받는 사람 화면 보기
          </Link>
          <p className="text-caption text-muted-foreground [word-break:keep-all]">
            지금은 시범 버전이라 실제로 보내지지 않아요. 받는 사람 화면은 이 휴대폰에서만 열려요. 공유 관리에서 언제든 해제할 수 있어요.
          </p>
          <Link to="/my/share/manage" className="inline-flex h-12 items-center px-2 text-caption font-medium underline underline-offset-4">공유 관리</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="pb-6">
      <SubHeader title="기록 공유하기" />
      <div className="space-y-4 px-6">
        <p className="text-body font-medium">고른 기록만 정한 사람에게 링크로 보여줘요.</p>
        {sharedN > 0 && (
          <Link to="/my/share/manage" className="flex min-h-14 items-center gap-4 rounded-[20px] border border-border bg-card px-6">
            <span className="flex-1 text-body font-medium">공유 관리 · {sharedN}개 설정됨</span>
            <Chevron />
          </Link>
        )}
        <ol className="flex gap-2" aria-label="단계">
          {STEPS.map((s, i) => (
            <li key={s} className="flex-1" aria-current={i === step ? "step" : undefined}>
              <span className={`block h-1 rounded-full ${i <= step ? "bg-ink" : "bg-[#D1D1D6]"}`} />
              <span className={`mt-2 block text-caption ${i === step ? "font-medium" : "text-muted-foreground"}`}>{i + 1}. {s}</span>
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
                  <label key={q} className="flex min-h-16 cursor-pointer items-center gap-4 px-6 py-4">
                    <input type="checkbox" className="size-5 shrink-0 accent-[#1A1918]" checked={on} onChange={() => setPicked(on ? picked.filter((x) => x !== q) : [...picked, q])} />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2 text-caption text-muted-foreground">
                        {cat && <Dot catId={cat.id} />}
                        {cat?.name}
                      </span>
                      <span className="block text-body">{getQuestion(q)?.core}</span>
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
              {scopes.map(([v, t, d]) => (
                <button
                  key={v}
                  type="button"
                  role="radio"
                  aria-checked={scope === v}
                  onClick={() => setScope(v)}
                  className={`flex min-h-16 w-full items-center gap-4 rounded-[20px] border bg-card px-6 py-4 text-left ${scope === v ? "border-ink border-2" : "border-border"}`}
                >
                  <span className={`flex size-5 shrink-0 items-center justify-center rounded-full border-2 border-ink`}>
                    {scope === v && <span className="size-2.5 rounded-full bg-ink" />}
                  </span>
                  <span>
                    <span className="block text-body font-medium">{t}</span>
                    <span className="block text-caption text-muted-foreground">{d}</span>
                  </span>
                </button>
              ))}
            </div>
            <p className="text-caption text-muted-foreground">공유한 뒤에도 공유 관리에서 언제든 해제할 수 있어요.</p>
            <div className="flex gap-2">
              <button type="button" className="h-14 rounded-full border border-ink px-6 text-body font-medium" onClick={() => setStep(0)}>이전</button>
              <button type="button" className={primary} onClick={() => setStep(2)}>다음</button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <p className="text-caption">
              공개 범위: <b>{SCOPES.find((s) => s[0] === scope)?.[1]}</b>
            </p>
            {hasVoice && (
              <Card className="flex items-center gap-4 px-6 py-2">
                <span className="flex-1">
                  <span className="block text-body font-medium">{!noVoice ? "목소리 포함" : "목소리는 글로만 보내요"}</span>
                  {<span className="block text-caption text-muted-foreground">목소리는 빼고 보내기</span>}
                </span>
                {<Toggle on={noVoice} onChange={setNoVoice} label="목소리는 빼고 보내기" />}
              </Card>
            )}
            <CoverPicker qids={picked} records={records} value={coverSrc} onChange={setCover} bookCover={personaCover(profile.name)} />
            <div className="space-y-2">
              {picked.map((q) => {
                const cat = categoryOfQuestion(q);
                if (!cat) return null;
                const c = cardColors(cat);
                const r = records[q];
                const voice = !!r?.voices?.length;
                return (
                  <div key={q} className="rounded-[20px] p-6" style={{ ...catVars(cat.id), background: c.bg, color: c.fg }}>
                    <p className="text-caption font-medium">
                      {cat.name}
                      {voice && (!noVoice ? " · 목소리 포함" : " · 목소리는 글로만")}
                    </p>
                    <p className="mt-1 text-body font-medium">{getQuestion(q)?.core}</p>
                    <p className="mt-2 line-clamp-2 text-caption">{r?.answers.find((a) => a.trim()) || r?.voices?.[0]?.text}</p>
                  </div>
                );
              })}
            </div>
            <p className="text-caption text-muted-foreground">지금은 시범 버전이라 실제로 보내지지 않아요. 링크와 받는 사람 화면만 만들어져요.</p>
            <div className="flex gap-2">
              <button type="button" className="h-14 rounded-full border border-ink px-6 text-body font-medium" onClick={() => setStep(1)}>이전</button>
              <button type="button" className={primary} onClick={submit}>링크 만들기</button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
