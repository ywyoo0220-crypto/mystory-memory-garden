import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { prefs, usePrefs } from "@/lib/prefs";
import { PinPad } from "@/components/my/PinPad";
import { SubHeader } from "@/components/my/ui";

export const Route = createFileRoute("/my/settings/lock")({
  head: () => ({
    meta: [
      { title: "앱 잠금 — MyStory" },
      { name: "description", content: "숫자 4자리로 앱을 잠가요." },
      { property: "og:title", content: "앱 잠금 — MyStory" },
      { property: "og:description", content: "숫자 4자리로 앱을 잠가요." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: LockSettings,
});

function LockSettings() {
  const { pinHash } = usePrefs();
  const navigate = useNavigate();
  const [first, setFirst] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const onDone = useCallback(
    async (p: string) => {
      if (!first) {
        setFirst(p);
        setErr(null);
        return;
      }
      if (p !== first) {
        setFirst(null);
        setErr("두 번 입력한 숫자가 달라요. 다시 정하세요.");
        return;
      }
      await prefs.setPin(p);
      try { sessionStorage.setItem("mystory.unlocked", "1"); } catch { /* noop */ }
      toast("앱 잠금을 켰어요");
      navigate({ to: "/my/settings" });
    },
    [first, navigate],
  );
  return (
    <main className="pb-6">
      <SubHeader title="앱 잠금" back="/my/settings" />
      {pinHash ? (
        <div className="space-y-4 px-6">
          <p className="text-[1.0625rem] leading-[1.7]">앱 잠금이 켜져 있어요. 앱을 열 때마다 숫자 4자리를 입력해야 해요.</p>
          <button
            type="button"
            className="flex h-14 w-full items-center justify-center rounded-full border border-ink text-[1.0625rem] font-semibold"
            onClick={async () => { await prefs.setPin(null); toast("앱 잠금을 껐어요"); }}
          >
            앱 잠금 끄기
          </button>
        </div>
      ) : (
        <PinPad title={first ? "한 번 더 입력하세요." : "숫자 4자리를 정하세요."} error={err} onDone={onDone} />
      )}
    </main>
  );
}
