import { createFileRoute, Link } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { actions, useStore, type TextSize } from "@/lib/store";
import { usePrefs } from "@/lib/prefs";
import { Card, Chevron, rowCls, Segmented, SubHeader } from "@/components/my/ui";
import { Button } from "@/components/ui/button";
import { resetApp } from "@/lib/reset";
import { TextSizeChoice } from "@/components/TextSizeChoice";
import { josa, useDeviceName } from "@/lib/device";
import { enableDemo, isDemo } from "@/lib/demo";

export const Route = createFileRoute("/my/settings/")({
  head: () => ({
    meta: [
      { title: "설정 — 마이스토리" },
      { name: "description", content: "글자 크기, 처음 보기, 앱 잠금과 데이터." },
      { property: "og:title", content: "설정 — 마이스토리" },
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
  const [confirmReset, setConfirmReset] = useState(false);
  const [resetting, setResetting] = useState(false);
  const device = useDeviceName();
  const taps = useRef<number[]>([]);
  const demoTap = () => {
    const now = Date.now();
    taps.current = [...taps.current.filter((t) => now - t < 3000), now];
    if (taps.current.length < 5) return;
    taps.current = [];
    if (isDemo()) return void toast("이미 체험 모드예요");
    enableDemo();
    toast("체험 모드를 켰어요. 사진은 체험용 사진만 떠요.");
  };
  const label = "px-2 pb-2 text-caption font-medium";
  const small = "h-12 shrink-0 rounded-full border border-ink px-6 text-caption font-medium";
  const danger = "h-12 shrink-0 rounded-full bg-destructive/10 px-6 text-caption font-medium text-destructive";
  return (
    <main className="pb-6">
      <SubHeader title="설정" />
      <div className="space-y-6 px-6">
        <Card className="divide-y overflow-hidden">
          <div className="px-6 py-4">
            <span id="size-label" className="block text-body font-medium">글자 크기</span>
            <div className="mt-3">
              <TextSizeChoice labelledBy="size-label" />
            </div>
          </div>
          <div className={rowCls}>
            <span className="flex-1 text-body font-medium">처음 보기</span>
            <Segmented compact label="처음 보여줄 보기" value={defaultView} onChange={actions.setDefaultView} options={[["topic", "주제별"], ["period", "시기별"]]} />
          </div>
          <Link to="/my/settings/lock" className={rowCls}>
            <span className="flex-1">
              <span className="block text-body font-medium">앱 잠금</span>
              <span className="block text-caption text-muted-foreground">{pinHash ? "켜짐" : "꺼짐"}</span>
            </span>
            <Chevron />
          </Link>
        </Card>
        <section>
          {/* Exhibition setup: five taps on this heading turn on try-out mode (no visible control, and no way back here). */}
          <h2 className={`${label} select-none`} onClick={demoTap}>데이터</h2>
          <Card className="divide-y overflow-hidden">
            <div className={rowCls}>
              <span className="flex-1 text-body font-medium">예시 기록 담기</span>
              <Button variant="palette" type="button" className={small} onClick={() => { actions.restoreExamples(); toast("예시 기록을 담았어요"); }}>불러오기</Button>
            </div>
            <div className={rowCls}>
              <span className="flex-1 text-body font-medium">예시 기록 비우기</span>
              <button type="button" className={small} onClick={() => { actions.clearExamples(); toast("예시 기록을 비웠어요"); }}>비우기</button>
            </div>
            {confirm ? (
              <div className="px-6 py-4" role="alert">
                <p className="text-body font-medium">모든 기록을 지울까요? 되돌릴 수 없어요.</p>
                <div className="mt-4 flex gap-2">
                  <button type="button" className="h-12 rounded-full bg-destructive px-6 text-caption font-medium text-destructive-foreground" onClick={() => { actions.clearAll(); setConfirm(false); toast("모든 기록을 지웠어요"); }}>모두 지우기</button>
                  <button type="button" className={small} onClick={() => setConfirm(false)}>그대로 두기</button>
                </div>
              </div>
            ) : (
              <div className={rowCls}>
                <span className="flex-1 text-body font-medium text-destructive">모든 기록 지우기</span>
                <button type="button" className={`${danger}`} onClick={() => setConfirm(true)}>지우기</button>
              </div>
            )}
          </Card>
        </section>
        <section>
          <h2 className={label}>{device} 넘겨주기</h2>
          <Card className="divide-y overflow-hidden">
            {confirmReset ? (
              <div className="px-6 py-4" role="alert">
                <p className="text-body font-medium">기록, 사진, 목소리, 이름, 앱 잠금, 설정을 모두 지우고 처음 설치한 상태로 되돌릴까요? 되돌릴 수 없어요.</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={resetting}
                    className="h-12 rounded-full bg-destructive px-6 text-caption font-medium text-destructive-foreground disabled:opacity-40"
                    onClick={async () => {
                      setResetting(true);
                      await resetApp();
                      window.location.replace("/");
                    }}
                  >
                    {resetting ? "되돌리는 중…" : "처음으로 되돌리기"}
                  </button>
                  <button type="button" className={small} onClick={() => setConfirmReset(false)}>그대로 두기</button>
                </div>
              </div>
            ) : (
              <div className={rowCls}>
                <span className="flex-1">
                  <span className="block text-body font-medium text-destructive">처음 상태로 되돌리기</span>
                  <span className="block text-caption text-muted-foreground">다른 사람이 이 {device}{josa(device, "으로", "로")} 처음부터 쓸 수 있게 해요.</span>
                </span>
                <button type="button" className={`${danger}`} onClick={() => setConfirmReset(true)}>되돌리기</button>
              </div>
            )}
          </Card>
        </section>
      </div>
    </main>
  );
}
