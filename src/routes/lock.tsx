import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useState } from "react";
import wordmark from "@/assets/mystory_wordmark.png.asset.json";
import { checkPin } from "@/lib/prefs";
import { PinPad } from "@/components/my/PinPad";

export const Route = createFileRoute("/lock")({
  head: () => ({
    meta: [
      { title: "잠금 — MyStory" },
      { name: "description", content: "숫자 4자리를 입력해 MyStory를 열어요." },
      { property: "og:title", content: "잠금 — MyStory" },
      { property: "og:description", content: "숫자 4자리를 입력해 MyStory를 열어요." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Lock,
});

function Lock() {
  const navigate = useNavigate();
  const [err, setErr] = useState<string | null>(null);
  const onDone = useCallback(
    async (p: string) => {
      if (await checkPin(p)) {
        try { sessionStorage.setItem("mystory.unlocked", "1"); } catch { /* noop */ }
        navigate({ to: "/" });
      } else setErr("숫자가 맞지 않아요.");
    },
    [navigate],
  );
  return (
    <main className="flex min-h-app flex-col items-center justify-center gap-10 py-10">
      <img src={wordmark.url} alt="MyStory" className="h-[1.875rem] w-auto" />
      <PinPad title="숫자 4자리를 입력하세요." error={err} onDone={onDone} />
    </main>
  );
}
