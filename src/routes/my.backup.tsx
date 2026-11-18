import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { actions, hasContent, normalizeRecords, recordPhotos, useStore, voiceKeys, type Records } from "@/lib/store";
import { getPrefs, prefs, type Profile } from "@/lib/prefs";
import { blobToDataUrl, clearAudio, dataUrlToBlob, getAudio, putAudio } from "@/lib/audio";
import { clearMedia, getMedia, isMediaRef, putMediaAt } from "@/lib/media";
import { Card, SubHeader } from "@/components/my/ui";

export const Route = createFileRoute("/my/backup")({
  head: () => ({
    meta: [
      { title: "백업과 복원 — MyStory" },
      { name: "description", content: "글, 사진, 목소리를 백업 파일로 저장하고 다시 불러와요." },
      { property: "og:title", content: "백업과 복원 — MyStory" },
      { property: "og:description", content: "글, 사진, 목소리를 백업 파일로 저장하고 다시 불러와요." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Backup,
});

type BackupFile = { app: string; v: number; t: number; records: Records; profile?: Profile; audio?: Record<string, string>; media?: Record<string, string> };

function Backup() {
  const { records } = useStore();
  const [busy, setBusy] = useState(false);
  const [fallback, setFallback] = useState<string | null>(null);
  const file = useRef<HTMLInputElement>(null);

  const make = async () => {
    setBusy(true);
    setFallback(null);
    try {
      const audio: Record<string, string> = {};
      const media: Record<string, string> = {};
      for (const [id, r] of Object.entries(records)) {
        for (const k of voiceKeys(id, r)) {
          const b = await getAudio(k).catch(() => undefined);
          if (b) audio[k] = await blobToDataUrl(b);
        }
        for (const p of recordPhotos(r).filter(isMediaRef)) {
          const b = await getMedia(p).catch(() => undefined);
          if (b) media[p] = await blobToDataUrl(b);
        }
      }
      const { profile } = getPrefs();
      const data: BackupFile = { app: "myStory", v: 1, t: Date.now(), records, profile: { ...profile }, audio, media };
      const json = JSON.stringify(data);
      try {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(new Blob([json], { type: "application/json" }));
        a.download = "mystory-backup.json";
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(a.href), 4000);
        toast("백업 파일을 만들었어요");
      } catch {
        setFallback(json);
      }
    } finally {
      setBusy(false);
    }
  };

  const restore = async (f: File) => {
    let data: BackupFile;
    try {
      data = JSON.parse(await f.text()) as BackupFile;
      if (data.app !== "myStory" || typeof data.records !== "object") throw new Error();
    } catch {
      return void toast("MyStory 백업 파일이 아니에요");
    }
    const incoming = normalizeRecords(data.records);
    if (!Object.keys(incoming).length) return void toast("백업 파일에 불러올 기록이 없어요");
    await clearAudio();
    for (const [k, d] of Object.entries(data.audio ?? {})) await putAudio(k, await dataUrlToBlob(d));
    if (data.media) {
      await clearMedia();
      for (const [k, d] of Object.entries(data.media)) await putMediaAt(k, await dataUrlToBlob(d));
    }
    actions.replaceRecords(incoming);
    prefs.setProfile(data.profile ?? { name: "", birth: "" });
    toast("기록을 복원했어요");
  };

  const n = Object.values(records).filter(hasContent).length;
  const btn = "flex h-14 w-full items-center justify-center rounded-full text-[1.0625rem] font-semibold disabled:opacity-40";
  return (
    <main className="pb-6">
      <SubHeader title="백업과 복원" sub="백업 파일에는 글, 사진, 목소리가 모두 들어 있어요. 새 휴대폰에서 ‘복원하기’로 불러오면 그대로 돌아와요." />
      <div className="space-y-3 px-4">
        <Card className="space-y-3 p-5">
          <p className="text-[0.9375rem] text-muted-foreground">지금 기록 {n}개</p>
          <button type="button" className={`${btn} bg-ink text-ink-foreground`} onClick={() => void make()} disabled={busy}>
            {busy ? "만드는 중…" : "백업 파일 만들기"}
          </button>
          <button type="button" className={`${btn} border border-ink`} onClick={() => file.current?.click()}>
            백업 파일로 복원하기
          </button>
        </Card>
        {fallback && (
          <Card className="space-y-2 p-5">
            <p className="text-[0.9375rem] font-medium">아래 내용을 복사해 두세요.</p>
            <textarea readOnly value={fallback} className="h-48 w-full rounded-xl border border-[#D1D1D6] p-3 text-[0.75rem]" onFocus={(e) => e.currentTarget.select()} />
          </Card>
        )}
      </div>
      <input
        ref={file}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          e.target.value = "";
          if (f) void restore(f);
        }}
      />
    </main>
  );
}
