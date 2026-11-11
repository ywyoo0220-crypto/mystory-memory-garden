import { createFileRoute } from "@tanstack/react-router";
import { categoryOfQuestion, getQuestion } from "@/lib/data";
import { useRef } from "react";
import { toast } from "sonner";
import { actions, hasContent, useStore, voiceKeys, type Records, type StoryRecord } from "@/lib/store";
import { blobToDataUrl, dataUrlToBlob, getAudio, putAudio } from "@/lib/audio";

export const Route = createFileRoute("/my")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "MY — myStory" },
      { name: "description", content: "기록 현황과 설정, 내보내기." },
      { property: "og:title", content: "MY — myStory" },
      { property: "og:description", content: "기록 현황과 설정, 내보내기." },
    ],
  }),
  component: My,
});

function My() {
  const { records, large } = useStore();
  const entries = Object.entries(records).filter(([, r]) => hasContent(r));
  const topicN = entries.filter(([q]) => q.startsWith("T")).length;
  const periodN = entries.length - topicN;
  const exampleN = entries.filter(([, r]) => r.example).length;

  const fileRef = useRef<HTMLInputElement>(null);

  /** Backup = records + audio as { "recordId:step": dataURL }. */
  const exportJson = async () => {
    const out = entries.map(([id, r]) => {
      const q = getQuestion(id);
      return { id, category: categoryOfQuestion(id)?.name, questions: q ? [q.core, ...q.followUps] : [], ...r };
    });
    const audio: Record<string, string> = {};
    for (const [id, r] of entries)
      for (const k of voiceKeys(id, r)) {
        const b = await getAudio(k).catch(() => undefined);
        if (b) audio[k] = await blobToDataUrl(b);
      }
    const blob = new Blob([JSON.stringify({ records: out, audio }, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `mystory-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const importJson = async (file: File) => {
    try {
      const data = JSON.parse(await file.text()) as { records?: (StoryRecord & { id: string })[]; audio?: Record<string, string> } | (StoryRecord & { id: string })[];
      const list = Array.isArray(data) ? data : (data.records ?? []);
      const incoming: Records = {};
      for (const { id, category: _c, questions: _q, ...r } of list as (StoryRecord & { id: string; category?: string; questions?: string[] })[])
        if (id && Array.isArray(r.answers)) incoming[id] = r;
      const audio = Array.isArray(data) ? {} : (data.audio ?? {});
      for (const [k, d] of Object.entries(audio)) await putAudio(k, await dataUrlToBlob(d));
      actions.importRecords(incoming);
      toast(`기록 ${Object.keys(incoming).length}개를 불러왔어요`);
    } catch {
      toast("백업 파일을 읽지 못했어요");
    }
  };

  const row = "flex min-h-16 w-full items-center justify-between px-6 text-left text-[1.0625rem]";
  return (
    <main className="px-6 pt-12">
      <h1 className="font-serif text-[1.75rem]">MY</h1>
      <div className="mt-8 grid grid-cols-3 gap-2">
        {[
          ["전체", entries.length],
          ["주제별", topicN],
          ["시간순", periodN],
        ].map(([l, n]) => (
          <div key={l} className="rounded-3xl border border-border bg-card p-5">
            <p className="text-[0.875rem] text-muted-foreground">{l}</p>
            <p className="mt-1 font-serif text-[1.75rem]">{n}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 divide-y overflow-hidden rounded-[28px] border border-border bg-card">
        <button type="button" className={row} onClick={actions.toggleLarge} aria-pressed={large}>
          큰 글씨
          <span className={`flex h-8 w-14 items-center rounded-full p-1 transition-colors ${large ? "bg-ink" : "bg-muted"}`}>
            <span className={`size-6 rounded-full bg-card transition-transform ${large ? "translate-x-6" : ""}`} />
          </span>
        </button>
        <button type="button" className={row} onClick={() => void exportJson()} disabled={!entries.length}>
          백업 파일 내보내기 <span className="text-[0.875rem] text-muted-foreground">JSON</span>
        </button>
        <button type="button" className={row} onClick={() => fileRef.current?.click()}>
          백업 파일 불러오기
        </button>
        <button
          type="button"
          className={`${row} disabled:opacity-40`}
          disabled={!exampleN}
          onClick={() => window.confirm("예시 기록을 비울까요?") && actions.clearExamples()}
        >
          예시 기록 비우기 <span className="text-[0.875rem] text-muted-foreground">{exampleN}개</span>
        </button>
        <button type="button" className={row} onClick={actions.restoreExamples}>
          예시 기록 다시 불러오기
        </button>
        <button
          type="button"
          className={`${row} text-destructive disabled:opacity-40`}
          disabled={!entries.length}
          onClick={() => window.confirm("모든 기록을 지울까요? 되돌릴 수 없어요.") && actions.clearAll()}
        >
          모든 기록 지우기
        </button>
      </div>
      <p className="mt-6 text-[0.9375rem] leading-[1.6] text-muted-foreground">
        기록은 이 기기의 브라우저에만 저장됩니다. 백업 파일에는 글, 사진, 목소리가 모두 들어 있어요.
      </p>
      <input
        ref={fileRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          e.target.value = "";
          if (f) void importJson(f);
        }}
      />
    </main>
  );
}
