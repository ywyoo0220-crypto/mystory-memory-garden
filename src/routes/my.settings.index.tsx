import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { actions, useStore, type TextSize } from "@/lib/store";
import { prefs, usePrefs } from "@/lib/prefs";
import { Card, Chevron, rowCls, Segmented, SubHeader, Toggle } from "@/components/my/ui";

export const Route = createFileRoute("/my/settings/")({
  head: () => ({
    meta: [
      { title: "설정 — myStory" },
      { name: "description", content: "글자 크기, 처음 보기, 앱 잠금, 알림과 데이터." },
      { property: "og:title", content: "설정 — myStory" },
      { property: "og:description", content: "글자 크기, 처음 보기, 앱 잠금, 알림과 데이터." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Settings,
});

function Settings() {
  const { textSize, defaultView } = useStore();
  const { pinHash, notify, aiGreeting } = usePrefs();
  const [confirm, setConfirm] = useState(false);
  const label = "px-2 pb-2 text-[0.9375rem] font-bold";
  const small = "h-12 shrink-0 rounded-full border border-ink px-5 text-[0.9375rem] font-medium";
  return (
    <main className="pb-6">
      <SubHeader title="설정" />
      <div className="space-y-6 px-4">
        <section>
          <h2 className={label}>글자 크기</h2>
          <Segmented<TextSize> label="글자 크기" value={textSize} onChange={actions.setTextSize} options={[[0, "보통"], [1, "크게"], [2, "아주 크게"]]} />
        </section>
        <section>
          <h2 className={label}>처음 보여줄 보기</h2>
          <Segmented label="처음 보여줄 보기" value={defaultView} onChange={actions.setDefaultView} options={[["topic", "주제별"], ["period", "시간순"]]} />
        </section>
        <Card className="divide-y overflow-hidden">
          <Link to="/my/settings/lock" className={rowCls}>
            <span className="flex-1">
              <span className="block text-[1.0625rem] font-medium">앱 잠금</span>
              <span className="block text-[0.875rem] text-muted-foreground">{pinHash ? "켜짐" : "꺼짐"}</span>
            </span>
            <Chevron />
          </Link>
          <div className={rowCls}>
            <span className="flex-1">
              <span className="block text-[1.0625rem] font-medium">기록 알림</span>
              <span className="block text-[0.875rem] text-muted-foreground">오늘의 질문을 알림으로 받아요</span>
            </span>
            <Toggle on={notify} onChange={prefs.setNotify} label="기록 알림" />
          </div>
          <div className={rowCls}>
            <span className="flex-1">
              <span className="block text-[1.0625rem] font-medium">AI 인사 한마디</span>
            </span>
            <Toggle on={aiGreeting} onChange={prefs.setAiGreeting} label="AI 인사 한마디" />
          </div>
        </Card>
        <section>
          <h2 className={label}>데이터</h2>
          <Card className="divide-y overflow-hidden">
            <div className={rowCls}>
              <span className="flex-1 text-[1.0625rem] font-medium">처음 안내 다시 보기</span>
              <Link to="/onboarding/$n" params={{ n: "1" }} className={`${small} inline-flex items-center`}>보기</Link>
            </div>
            <div className={rowCls}>
              <span className="flex-1 text-[1.0625rem] font-medium">예시 기록 다시 담기</span>
              <button type="button" className={small} onClick={() => { actions.restoreExamples(); toast("예시 기록을 담았어요"); }}>불러오기</button>
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
