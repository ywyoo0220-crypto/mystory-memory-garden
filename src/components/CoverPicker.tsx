import { useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useMediaUrl } from "@/lib/media";
import { resizeCover } from "@/lib/book";
import { recordPhotos, type Records } from "@/lib/store";

/** Cover photo for a share: none, the example cover (example records only), an uploaded photo, or a photo from the chosen records. */
export function CoverPicker({ qids, records, value, onChange, bookCover }: { qids: string[]; records: Records; value: string; onChange: (src: string) => void; bookCover?: string | undefined }) {
  const input = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState<string>("");
  const examples = qids.some((q) => records[q]?.example);
  const photos = [...new Set(qids.flatMap((q) => (records[q] ? recordPhotos(records[q]!) : [])))];
  const upload = async (file: File) => {
    setUploading(true);
    try {
      const src = await resizeCover(file);
      setUploaded(src);
      onChange(src);
    } catch {
      toast.error("사진을 불러오지 못했어요");
    } finally {
      setUploading(false);
    }
  };
  return (
    <div>
      <h2 className="text-body font-medium">표지 사진을 넣을까요?</h2>
      <p className="mt-2 text-caption text-muted-foreground">받는 사람 화면 맨 위에 크게 들어가요.</p>
      <div role="group" aria-label="표지 사진" className="cover-options">
        <Tile label="사진 없이" selected={value === ""} onClick={() => onChange("")} />
        <Button variant="palette" className="cover-tile cover-upload" aria-label="휴대폰 사진 올리기" disabled={uploading} onClick={() => input.current?.click()}>
          {uploading ? "올리는 중…" : <>휴대폰<br />사진 올리기</>}
        </Button>
        {uploaded && <Tile label="올린 사진" src={uploaded} selected={value === uploaded} onClick={() => onChange(uploaded)} />}
        {bookCover && <Tile label="책 표지 그림" src={bookCover} selected={value === bookCover} onClick={() => onChange(bookCover)} />}
        {examples && !bookCover && <Tile label="예시 표지 사진" src="/ex_cover.jpg" selected={value === "/ex_cover.jpg"} onClick={() => onChange("/ex_cover.jpg")} />}
        {photos.map((src, i) => <Tile key={src} label={`기록 사진 ${i + 1}`} src={src} selected={value === src} onClick={() => onChange(src)} />)}
      </div>
      <input ref={input} type="file" accept="image/*" aria-label="표지 사진 파일" className="hidden" onChange={(e) => {
        const f = e.target.files?.[0]; e.target.value = "";
        if (f) void upload(f);
      }} />
    </div>
  );
}

function Tile({ label, src, selected, onClick }: { label: string; src?: string; selected: boolean; onClick: () => void }) {
  const url = useMediaUrl(src);
  return (
    <Button variant="palette" className="cover-tile" aria-label={label} aria-pressed={selected} onClick={onClick}>
      {url ? <img src={url} alt={label} /> : label}
    </Button>
  );
}
