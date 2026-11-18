import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { TextSizeButton } from "@/components/TextSizeButton";
import { toast } from "sonner";
import wordmark from "@/assets/mystory_wordmark.png.asset.json";
import { getQuestion } from "@/lib/data";
import { useStore, type Records, type StoryRecord } from "@/lib/store";
import { getPrefs, periodYears, prefs, usePrefs } from "@/lib/prefs";
import { useMediaUrl } from "@/lib/media";
import { bookParts, bookPhotos, chosenCover, containsExamples, resizeCover, type BookChapter, type BookPart, type BookPhoto, type BookScope } from "@/lib/book";
import { CategoryIcon } from "@/components/CategoryIcon";
import { Segmented, SubHeader } from "@/components/my/ui";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/my/export")({
  head: () => ({ meta: [
    { title: "기록 책으로 묶기 — MyStory" },
    { name: "description", content: "남긴 기록을 한 권으로 엮고 대표 사진과 함께 PDF로 저장해요." },
    { property: "og:title", content: "기록 책으로 묶기 — MyStory" },
    { property: "og:description", content: "남긴 기록을 한 권으로 엮고 대표 사진과 함께 PDF로 저장해요." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: ExportPage,
});

function ExportPage() {
  const { records } = useStore();
  const { profile } = usePrefs();
  const [scope, setScope] = useState<BookScope>("all");
  const [uploading, setUploading] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const all = bookParts(records);
  const both = all.length === 2;
  const parts = both ? bookParts(records, scope) : all;
  const chapters = parts.flatMap((p) => p.chapters);
  const count = parts.reduce((n, p) => n + p.count, 0);
  const photos = bookPhotos(records, parts);
  const examples = containsExamples(records, parts);
  const cover = chosenCover(profile, photos, examples);
  const coverUrl = useMediaUrl(cover.src);
  const twoParts = parts.length === 2;
  const photoKeys = photos.map((p) => p.key).join("|");

  // Invalidate removed/excluded choices permanently, rather than restoring them unexpectedly later.
  useEffect(() => {
    if (profile.cover && profile.cover !== cover.key) prefs.setProfile({ ...getPrefs().profile, cover: "" });
  }, [profile.cover, cover.key, photoKeys]);

  const select = (key: string) => {
    if (!prefs.setProfile({ ...getPrefs().profile, cover: key })) toast.error("저장 공간이 부족해요");
  };
  const upload = async (file: File) => {
    setUploading(true);
    try {
      const coverUp = await resizeCover(file);
      if (!prefs.setProfile({ ...getPrefs().profile, cover: "up", coverUp })) return void toast.error("저장 공간이 부족해요");
      toast.success("대표 사진을 넣었어요");
    } catch { toast.error("사진을 불러오지 못했어요"); }
    finally { setUploading(false); }
  };

  return (
    <main className="book-export pb-6">
      <SubHeader title="기록 책으로 묶기" close />
      <section className="book-controls no-print space-y-6 px-6 pb-6">
        <div>
          <p className="text-body font-medium">남긴 기록을 한 권으로 엮어요.</p>
          <p className="mt-2 text-caption text-muted-foreground">
            {both && "주제 질문에 남긴 기록이 1부, 시기 질문에 남긴 기록이 2부가 돼요. "}
            아래는 책의 미리보기예요. ‘PDF로 저장’을 누르면 인쇄 창에서 PDF로 저장할 수 있어요.
          </p>
        </div>
        {both && <div className="space-y-4">
          <h2 className="text-body font-medium">담을 기록</h2>
          <Segmented<BookScope> label="담을 기록" value={scope} onChange={setScope} options={[["all", "전체"], ["topic", "주제별만"], ["period", "시기별만"]]} />
        </div>}
        <div>
          <h2 className="text-body font-medium">대표 사진을 넣을까요?</h2>
          <p className="mt-2 text-caption text-muted-foreground">표지에 크게 들어가요. 남긴 사진에서 고르거나 휴대폰에서 새로 올릴 수 있어요.</p>
          <div role="group" aria-label="대표 사진" className="cover-options">
            <CoverTile label="사진 없이" selected={cover.key === ""} onClick={() => select("")} />
            <Button variant="palette" className="cover-tile cover-upload" aria-pressed={false} aria-label="휴대폰 사진 올리기" disabled={uploading} onClick={() => input.current?.click()}>{uploading ? "올리는 중…" : <>휴대폰<br />사진 올리기</>}</Button>
            {profile.coverUp && <CoverTile label="올린 대표 사진" src={profile.coverUp} selected={cover.key === "up"} onClick={() => select("up")} />}
            {examples && <CoverTile label="예시 표지 사진" src="/ex_cover.jpg" selected={cover.key === "ex"} onClick={() => select("ex")} />}
            {photos.map((p, i) => <CoverTile key={p.key} label={`기록 사진 ${i + 1}`} src={p.src} selected={cover.key === p.key} onClick={() => select(p.key)} />)}
          </div>
          <input ref={input} type="file" accept="image/*" aria-label="대표 사진 파일" className="hidden" onChange={(e) => {
            const file = e.target.files?.[0]; e.target.value = "";
            if (file) void upload(file);
          }} />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="palette" disabled={!count || uploading} onClick={() => window.print()} className="h-14 min-w-0 flex-1 rounded-full bg-ink text-body font-medium text-ink-foreground">PDF로 저장</Button>
          <TextSizeButton />
        </div>
      </section>

      <article className="book-preview" aria-label="책 미리보기">
        <header className={`book-sheet book-cover ${coverUrl ? "has-cover-photo" : ""}`}>
          {coverUrl && <img src={coverUrl} alt="책 대표 사진" className="book-cover-photo" />}
          <Stripe chapters={chapters} />
          <div className="book-cover-info">
            <h2>{profile.name.trim() ? `${profile.name.trim()}의 이야기` : "나의 이야기"}</h2>
            <p>{count}개의 기록 · {new Date().getFullYear()}</p>
            <img src={wordmark.url} alt="MyStory" className="book-wordmark" />
          </div>
        </header>
        <section className="book-sheet book-contents">
          <h2>차례</h2>
          {parts.map((part, index) => <div key={part.kind} className="book-toc-part">
            <h3>{twoParts ? `${index + 1}부 · ` : ""}{part.title}</h3>
            {part.chapters.map(({ category, qids }) => <div className="book-toc-row" key={category.id}>
              <span className="book-color-square" style={{ background: category.color.background }} />
              <span>{category.name}</span><span className="book-count">{qids.length}</span>
            </div>)}
          </div>)}
        </section>
        {parts.map((part, index) => <BookPartPages key={part.kind} part={part} index={index} twoParts={twoParts} records={records} photos={photos} birth={profile.birth} />)}
      </article>
    </main>
  );
}

function CoverTile({ label, src, selected, onClick }: { label: string; src?: string; selected: boolean; onClick: () => void }) {
  const url = useMediaUrl(src);
  return <Button variant="palette" className="cover-tile" aria-label={label} aria-pressed={selected} onClick={onClick}>{url ? <img src={url} alt={label} /> : label}</Button>;
}

function Stripe({ chapters }: { chapters: BookChapter[] }) {
  return <div className="book-stripe" aria-hidden>{chapters.map(({ category, qids }) => <span key={category.id} style={{ background: category.color.background, flexGrow: qids.length }} />)}</div>;
}

function BookPartPages({ part, index, twoParts, records, photos, birth }: { part: BookPart; index: number; twoParts: boolean; records: Records; photos: BookPhoto[]; birth: string }) {
  return <>
    {twoParts && <section className="book-sheet book-part-page">
      <p className="book-part-number">{index + 1}부</p>
      <h2>{part.title}</h2>
      <p>{part.count}개의 기록</p>
      <Stripe chapters={part.chapters} />
    </section>}
    {part.chapters.map(({ category, qids }) => {
      const years = category.kind === "period" ? periodYears(birth, category.index) : "";
      return <section key={category.id} className="book-sheet book-chapter">
        <header className="book-chapter-header" style={{ background: category.color.background, color: category.color.text }}>
          <div className="book-chapter-heading"><CategoryIcon id={category.id} size={26} /><h2>{category.name}</h2></div>
          <p>{years ? `${years} · ` : ""}{qids.length}개의 기록</p>
        </header>
        <div className="book-chapter-body">{qids.map((qid) => {
          const rec = records[qid];
          return rec ? <BookRecord key={qid} qid={qid} rec={rec} photos={photos.filter((p) => p.qid === qid)} color={category.color.background} /> : null;
        })}</div>
      </section>;
    })}
  </>;
}

function BookRecord({ qid, rec, photos, color }: { qid: string; rec: StoryRecord; photos: BookPhoto[]; color: string }) {
  const q = getQuestion(qid);
  if (!q) return null;
  return <section className="book-record">
    <h3>{q.core}</h3>
    {[q.core, ...q.followUps].map((label, step) => {
      const voice = rec.voices?.find((v) => v.step === step);
      const text = rec.answers[step]?.trim() || voice?.text?.trim();
      const images = photos.filter((p) => p.step === step);
      if (!text && !images.length && !voice) return null;
      return <div key={step} className="book-answer-block">
        {step > 0 && <h4><span className="book-follow-square" style={{ background: color }} />{label}</h4>}
        {(text || voice) && <p className="book-answer">{voice && <span className="book-voice-tag">음성</span>}{text}</p>}
        {images.map((p) => <BookPhotoImage key={p.key} src={p.src} />)}
      </div>;
    })}
  </section>;
}

function BookPhotoImage({ src }: { src: string }) {
  const url = useMediaUrl(src);
  return url ? <img src={url} alt="기록 사진" className="book-record-photo" /> : null;
}