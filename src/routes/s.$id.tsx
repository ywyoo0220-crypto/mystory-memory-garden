import { createFileRoute, Link, useCanGoBack, useRouter } from "@tanstack/react-router";
import type { CSSProperties } from "react";
import { cardColors, categoryOfQuestion, getQuestion } from "@/lib/data";
import { recordPhotos, useStore, type StoryRecord } from "@/lib/store";
import { usePrefs } from "@/lib/prefs";
import { useMediaUrl } from "@/lib/media";
import { defaultCover, fullDate, sharedRecords, shareColor } from "@/lib/share";
import { CategoryIcon } from "@/components/CategoryIcon";
import { VoiceBar } from "@/components/VoicePlayer";
import { catVars } from "@/lib/theme";
import wordmark from "@/assets/mystory_wordmark.png.asset.json";

export const Route = createFileRoute("/s/$id")({
  head: () => ({
    meta: [
      { title: "MyStory에서 보낸 이야기" },
      { name: "description", content: "MyStory에서 골라 보낸 기록이에요." },
      { property: "og:title", content: "MyStory에서 보낸 이야기" },
      { property: "og:description", content: "MyStory에서 골라 보낸 기록이에요." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SharedPage,
});

/**
 * What the person who receives a share link sees: one page that scrolls.
 * Prototype: nothing is uploaded, so the page reads the records on this phone and opens only here.
 */
function SharedPage() {
  const { id } = Route.useParams();
  const { shares, profile } = usePrefs();
  const { records } = useStore();
  const share = shares.find((s) => s.id === id);
  const router = useRouter();
  const canGoBack = useCanGoBack();
  const close = () => (canGoBack ? router.history.back() : void router.navigate({ to: "/my/share/manage" }));
  if (!share) {
    return (
      <main className="flex min-h-app flex-col items-center justify-center px-6 text-center">
        <p className="text-body font-medium">이 링크는 열 수 없어요.</p>
        <p className="mt-2 text-caption text-muted-foreground [word-break:keep-all]">
          지금은 시범 버전이라, 링크를 만든 휴대폰에서만 받는 사람 화면을 볼 수 있어요.
        </p>
      </main>
    );
  }
  const qids = sharedRecords(share.qids, records);
  const color = shareColor(qids, profile.name);
  const name = profile.name.trim();
  const times = qids.map((q) => records[q]!.updatedAt);
  const span = times.length ? monthSpan(Math.min(...times), Math.max(...times)) : "";
  // Shares made before the cover step have no cover saved: example records then get the example cover.
  const cover = share.cover ?? defaultCover(qids, records, profile.name);
  return (
    // White page (not the app's grey) so pale category colours still read as blocks.
    <main className="relative min-h-app bg-white pb-16">
      <button type="button" aria-label="미리보기 닫기" onClick={close} className="fixed right-4 top-4 z-50 inline-flex h-12 items-center gap-2 rounded-full border border-border bg-card/85 px-4 text-caption font-medium text-ink shadow-sm backdrop-blur">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
        닫기
      </button>
      <section className="flex min-h-[85svh] flex-col px-6 pb-10 pt-8" style={{ background: color.bg, color: color.fg }}>
        <img src={wordmark.url} alt="MyStory" className="h-6 w-auto self-start" />
        {cover && <CoverPhoto src={cover} />}
        <h1 className="mt-8 text-center text-title">{name ? `${name}의 이야기` : "나의 이야기"}</h1>
        <p className="mt-2 text-center text-caption">기록 {qids.length}개{span && ` · ${span}`}</p>
        <p className="mt-auto pt-10 text-center text-caption [word-break:keep-all]">
          {name ? `${name} 님이` : "보낸 분이"} MyStory에서 골라 보낸 기록이에요.
        </p>
      </section>

      {/* Records are parted by a hairline above each one after the first. */}
      <div className="divide-y divide-border px-6">
        {qids.map((q) => (
          <div key={q} className="py-10 first:pt-10">
            <SharedRecord qid={q} rec={records[q]!} withVoice={share.withVoice} />
          </div>
        ))}
      </div>

      <footer className="mt-6 space-y-2 border-t border-border px-6 pt-12 text-center">
        <p className="text-body font-medium">MyStory</p>
        <p className="text-caption text-muted-foreground">질문에 답하며 나만의 색깔로 채워 가는 이야기</p>
        <p className="pt-6 text-caption text-muted-foreground [word-break:keep-all]">시범 버전 · 실제로 보내지지 않고, 링크를 만든 휴대폰에서만 열려요.</p>
        <Link to="/my/share/manage" className="inline-flex h-12 items-center px-2 text-caption font-medium underline underline-offset-4">공유 관리로 돌아가기</Link>
      </footer>
    </main>
  );
}

function monthSpan(a: number, b: number) {
  const f = (t: number) => { const d = new Date(t); return `${d.getFullYear()}년 ${d.getMonth() + 1}월`; };
  return f(a) === f(b) ? f(a) : `${f(a)}–${f(b)}`;
}

function CoverPhoto({ src }: { src: string }) {
  const url = useMediaUrl(src);
  if (!url) return null;
  // Natural proportions: no cropping of the person's photo.
  return <img src={url} alt="표지 사진" className="mx-auto mt-10 max-h-[46svh] w-auto max-w-[78%] object-contain" />;
}

function Photo({ src }: { src: string }) {
  const url = useMediaUrl(src);
  if (!url) return null;
  return <img src={url} alt="함께 남긴 사진" loading="lazy" className="w-full rounded-2xl" />;
}

/** One record: colour block with the core question, then the answers; follow-ups branch on a left line (as on home cards). */
function SharedRecord({ qid, rec, withVoice }: { qid: string; rec: StoryRecord; withVoice: boolean }) {
  const cat = categoryOfQuestion(qid);
  const q = getQuestion(qid);
  if (!cat || !q) return null;
  const c = cardColors(cat);
  const photos = recordPhotos(rec);
  const photosAt = (i: number) => photos.filter((_, k) => (rec.photoSteps?.[k] ?? 0) === i);
  const step = (label: string, i: number) => {
    const voice = rec.voices?.find((v) => v.step === i);
    const a = rec.answers[i]?.trim() || voice?.text?.trim();
    const ph = photosAt(i);
    if (!a && !voice && !ph.length) return null;
    return (
      <div key={i}>
        {/* Same as home cards: the question one size smaller, 8px above its answer. */}
        {i > 0 && <p className="mb-2 text-caption font-medium">{label}</p>}
        <div className="space-y-4">
        {voice && withVoice && (
          <div className="rounded-full border border-border bg-card py-2 pl-2 pr-4">
            <VoiceBar recordId={qid} voice={voice} text={a ?? ""} fg="var(--ink)" accent="var(--ink-foreground)" />
          </div>
        )}
        {a && (
          <p className="whitespace-pre-line text-body">
            {voice && <span className="mb-1 mr-2 inline-block rounded-full border border-ink px-2 py-0.5 text-caption font-medium leading-snug">음성 기록</span>}
            {a}
          </p>
        )}
        {ph.map((p) => <Photo key={p} src={p} />)}
        </div>
      </div>
    );
  };
  const follow = q.followUps.map((label, k) => step(label, k + 1)).filter(Boolean);
  return (
    <article>
      {/* Only the category name sits on its colour, as a small block (like the posters); the question is plain text on the page. */}
      <header>
        <p className="flex items-center gap-2 text-caption">
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 font-medium" style={{ ...catVars(cat.id), background: c.bg, color: c.fg } as CSSProperties}>
            <CategoryIcon id={cat.id} size={14} />
            {cat.name}
          </span>
          <span className="ml-auto tabular-nums text-muted-foreground">{fullDate(rec.updatedAt)}</span>
        </p>
        <h2 className="mt-4 text-title [word-break:keep-all]">{q.core}</h2>
      </header>
      <div className="space-y-6 pt-6">
        {step(q.core, 0)}
        {follow.length > 0 && <div className="space-y-6 border-l-2 border-border pl-4">{follow}</div>}
      </div>
    </article>
  );
}
