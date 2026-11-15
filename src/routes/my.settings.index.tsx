import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { actions, useStore, type TextSize } from "@/lib/store";
import { usePrefs } from "@/lib/prefs";
import { Card, Chevron, rowCls, Segmented, SubHeader } from "@/components/my/ui";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/my/settings/")({
  head: () => ({
    meta: [
      { title: "설정 — MyStory" },
      { name: "description", content: "글자 크기, 처음 보기, 앱 잠금과 데이터." },
      { property: "og:title", content: "설정 — MyStory" },
      { property: "og:description", content: "글자 크기, 처음 보기, 앱 잠금과 데이터." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Settings,
});

function Settings() {
  const { textSize, defaultView } = useStore();
  const { pinHash } = usePrefs();
  const [confirm, setConfirm] = useState(false);
  const label = "px-2 pb-2 text-[0.9375rem] font-bold";
  const small = "h-12 shrink-0 rounded-full border border-ink px-5 text-[0.9375rem] font-medium";
  return (
    <main className="pb-6">
      <SubHeader title="설정" />
      <div className="space-y-6 px-4">
        <Card className="divide-y overflow-hidden">
          <div className="px-5 py-4">
            <span className="block text-[1.0625rem] font-medium">글자 크기</span>
            <div role="radiogroup" aria-label="글자 크기" className="mt-3 grid grid-cols-2 gap-2">
              {([[0, "보통", "text-[1.25rem] font-semibold", ""], [1, "크게", "text-[1.875rem] font-extrabold", ""]] as const).map(([v, name, big]) => {
                const on = textSize === v;
                return (
                  <button key={v} type="button" role="radio" aria-checked={on} onClick={() => actions.setTextSize(v as TextSize)}
                    className={`relative flex min-h-[6rem] flex-col items-center justify-center gap-1 rounded-2xl border-2 bg-card text-foreground transition-colors ${on ? "border-ink" : "border-border"}`}>
                    <span aria-hidden className={`absolute right-2.5 top-2.5 flex size-[1.375rem] items-center justify-center rounded-full ${on ? "bg-ink text-ink-foreground" : "border-2 border-border"}`}>
                      {on && <svg viewBox="0 0 24 24" className="size-[0.875rem]" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>}
                    </span>
                    <span className={`leading-none ${big}`}>{name}</span>
                  </button>
                );
              })}
            </div>
          </div>
          <div className={rowCls}>
            <span className="flex-1 text-[1.0625rem] font-medium">처음 보기</span>
            <Segmented compact label="처음 보여줄 보기" value={defaultView} onChange={actions.setDefaultView} options={[["topic", "주제별"], ["period", "시간순"]]} />
          </div>
          <Link to="/my/settings/lock" className={rowCls}>
            <span className="flex-1">
              <span className="block text-[1.0625rem] font-medium">앱 잠금</span>
              <span className="block text-[0.875rem] text-muted-foreground">{pinHash ? "켜짐" : "꺼짐"}</span>
            </span>
            <Chevron />
          </Link>
        </Card>
        <section>
          <h2 className={label}>데이터</h2>
          <Card className="divide-y overflow-hidden">
            <div className={rowCls}>
              <span className="flex-1 text-[1.0625rem] font-medium">예시 기록 담기</span>
              <Button variant="palette" type="button" className={small} onClick={() => { actions.restoreExamples(); toast("예시 기록을 담았어요"); }}>불러오기</Button>
            </div>
            <div className={rowCls}>
              <span className="flex-1 text-[1.0625rem] font-medium">예시 기록 비우기</span>
              <button type="button" className={small} onClick={() => { actions.clearExamples(); toast("예시 기록을 비웠어요"); }}>비우기</button>
            </div>
            {confirm ? (
              <div className="px-5 py-4" role="alert">
                <p className="text-[1rem] font-medium">모든 기록을 지울까요? 되돌릴 수 없어요.</p>
                <div className="mt-3 flex gap-2">
                  <button type="button" className="h-12 rounded-full bg-destructive px-5 text-[0.9375rem] font-semibold text-destructive-foreground" onClick={() => { actions.clearAll(); setConfirm(false); toast("모든 기록을 지웠어요"); }}>모두 지우기</button>
                  <button type="button" className={small} onClick={() => setConfirm(false)}>그대로 두기</button>
                </div>
              </div>
            ) : (
              <div className={rowCls}>
                <span className="flex-1 text-[1.0625rem] font-medium text-destructive">모든 기록 지우기</span>
                <button type="button" className={`${small} border-destructive text-destructive`} onClick={() => setConfirm(true)}>지우기</button>
              </div>
            )}
          </Card>
        </section>
      </div>
    </main>
  );
}
