import { categoriesOf, type Category, type Kind } from "./data";
import { hasContent, recordPhotos, type Records } from "./store";
import type { Profile } from "./prefs";

export type BookScope = "all" | Kind;
export type BookChapter = { category: Category; qids: string[] };
export type BookPart = { kind: Kind; title: string; chapters: BookChapter[]; count: number };
export type BookPhoto = { key: string; src: string; qid: string; step: number };

export function bookParts(records: Records, scope: BookScope = "all"): BookPart[] {
  return (["topic", "period"] as const).filter((kind) => scope === "all" || scope === kind).map((kind) => {
    const chapters = categoriesOf(kind).map((category) => ({ category, qids: category.questions.filter((q) => hasContent(records[q.id])).map((q) => q.id) })).filter((c) => c.qids.length);
    return { kind, title: kind === "topic" ? "주제로 읽는 이야기" : "시기로 읽는 이야기", chapters, count: chapters.reduce((n, c) => n + c.qids.length, 0) };
  }).filter((part) => part.count);
}

export function bookPhotos(records: Records, parts: BookPart[]): BookPhoto[] {
  return parts.flatMap((part) => part.chapters.flatMap((c) => c.qids.flatMap((qid) => {
    const record = records[qid];
    if (!record) return [];
    const seen = new Map<number, number>();
    return recordPhotos(record).map((src, i) => {
      const step = record.photoSteps?.[i] ?? 0;
      const ordinal = seen.get(step) ?? 0;
      seen.set(step, ordinal + 1);
      return { key: `${qid}:${step}${ordinal ? `:${ordinal}` : ""}`, src, qid, step };
    });
  })));
}

export function containsExamples(records: Records, parts: BookPart[]) {
  return parts.some((p) => p.chapters.some((c) => c.qids.some((id) => records[id]?.example)));
}

export function chosenCover(profile: Profile, photos: BookPhoto[], examples: boolean) {
  const choice = profile.cover ?? (examples ? "ex" : "");
  if (choice === "ex") return examples ? { key: "ex", src: "/ex_cover.jpg" } : { key: "", src: undefined };
  if (choice === "up") return profile.coverUp ? { key: "up", src: profile.coverUp } : { key: "", src: undefined };
  const photo = photos.find((p) => p.key === choice);
  return photo ? { key: choice, src: photo.src } : { key: "", src: undefined };
}

/** Browser-only image processing; retain its proportions and never upscale. */
export async function resizeCover(file: File): Promise<string> {
  const url = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = url;
    await image.decode();
    const ratio = Math.min(1, 1400 / Math.max(image.naturalWidth, image.naturalHeight));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(image.naturalWidth * ratio);
    canvas.height = Math.round(image.naturalHeight * ratio);
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Image canvas unavailable");
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.8);
  } finally { URL.revokeObjectURL(url); }
}