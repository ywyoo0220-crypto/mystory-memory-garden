import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DEMO_PHOTOS, demoPhotoFiles, onDemoPhotoRequest } from "@/lib/demo";

/** Exhibition try-out devices: the photo set shown instead of the device photo library. */
export function DemoPhotoSheet() {
  const [req, setReq] = useState<{ multiple: boolean; resolve: (f: File[]) => void } | null>(null);
  const [picked, setPicked] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    onDemoPhotoRequest((r) => { setPicked([]); setReq(r); });
    return () => onDemoPhotoRequest(null);
  }, []);
  const close = (files: File[]) => { req?.resolve(files); setReq(null); setBusy(false); };
  const done = async (srcs: string[]) => {
    setBusy(true);
    try { close(await demoPhotoFiles(srcs)); } catch { close([]); }
  };
  const tap = (src: string) => {
    if (!req?.multiple) return void done([src]);
    setPicked((p) => (p.includes(src) ? p.filter((x) => x !== src) : [...p, src]));
  };
  return (
    <Dialog open={req !== null} onOpenChange={(o) => !o && !busy && close([])}>
      <DialogContent className="max-h-[90dvh] w-[calc(100%-2rem)] max-w-[40rem] overflow-y-auto rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-title">체험용 사진</DialogTitle>
          <DialogDescription className="text-body">{req?.multiple ? "넣을 사진을 누르고 ‘넣기’를 눌러 주세요." : "쓸 사진을 하나 눌러 주세요."}</DialogDescription>
        </DialogHeader>
        <div role="group" aria-label="체험용 사진" className="grid grid-cols-3 gap-2 tab:grid-cols-5">
          {DEMO_PHOTOS.map((src, i) => {
            const on = picked.includes(src);
            return (
              <button key={src} type="button" aria-label={`체험용 사진 ${i + 1}`} aria-pressed={req?.multiple ? on : undefined} disabled={busy} onClick={() => tap(src)}
                className={`relative aspect-square overflow-hidden rounded-xl border border-border ${on ? "outline outline-[3px] outline-offset-2 outline-ink" : ""}`}>
                <img src={src} alt="" loading="lazy" className="h-full w-full object-cover" />
                {on && <span className="absolute right-1 top-1 flex h-7 w-7 items-center justify-center rounded-full bg-ink text-caption font-medium text-ink-foreground">{picked.indexOf(src) + 1}</span>}
              </button>
            );
          })}
        </div>
        {req?.multiple && (
          <button type="button" disabled={!picked.length || busy} onClick={() => void done(picked)}
            className="mt-2 h-14 w-full rounded-full bg-ink text-body font-medium text-ink-foreground disabled:opacity-40">
            {busy ? "넣는 중…" : picked.length ? `${picked.length}장 넣기` : "넣기"}
          </button>
        )}
      </DialogContent>
    </Dialog>
  );
}
