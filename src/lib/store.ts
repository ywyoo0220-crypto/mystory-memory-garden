import { useSyncExternalStore } from "react";
import { EXAMPLE_RECORDS } from "@/data/exampleRecords";
import exampleProfilePhoto from "@/assets/example-profile.png.asset.json";
import { prefs } from "./prefs";
import type { Kind } from "./data";
import { clearMedia, deleteMedia, getMedia } from "./media";
import { audioKey, clearAudio, deleteAudio, fmtDur, putAudio } from "./audio";

/** Per-answer voice metadata; the blob itself lives in IndexedDB under audioKey(recordId, step). */
export type Voice = { step: number; dur: string; audio: boolean; text?: string | undefined; src?: string | undefined };
type LegacyClip = { id: string; durationSec: number; step: number };

export type StoryRecord = {
  answers: string[];
  photo?: string | undefined;
  photos?: string[] | undefined;
  photoSteps?: number[] | undefined;
  voices?: Voice[] | undefined;
  updatedAt: number;
  example?: boolean | undefined;
};
export type Records = Record<string, StoryRecord>;

const KEY = "mystory.records.v1";
const EXAMPLES_OPT_IN = "mystory.examples.opt-in.v1";
const LARGE = "mystory.large.v1";
const SIZE = "mystory.textsize.v1";
const DEFAULT_VIEW = "mystory.defaultView.v1";
export type TextSize = 0 | 1;
export function normalizeTextSize(value: number): TextSize {
  return value > 0 ? 1 : 0;
}
export function initialRecords(records: Records, examplesOptIn: boolean): Records {
  return examplesOptIn ? records : Object.fromEntries(Object.entries(records).filter(([, r]) => !r.example));
}
const VIEW = "mystory.view.v1";

try {
  if (typeof window !== "undefined") { localStorage.removeItem("mystory.theme"); localStorage.removeItem("mystory.hideThemeChips"); }
} catch {
  /* noop */
}

function read<T>(k: string, fb: T): T {
  try {
    const v = localStorage.getItem(k);
    return v ? (JSON.parse(v) as T) : fb;
  } catch {
    return fb;
  }
}
function write(k: string, v: unknown) {
  try {
    localStorage.setItem(k, JSON.stringify(v));
    return true;
  } catch {
    return false;
  }
}

/** Builds one record per EXAMPLE_RECORDS item; a voice plays its bundled file (src) or, without one, is read aloud. */
export function exampleSeeds(now = Date.now()): Records {
  return Object.fromEntries(
    EXAMPLE_RECORDS.map((e) => [
      e.id,
      {
        answers: [...e.answers],
        photos: e.photos.filter((p): p is string => !!p),
        photoSteps: e.photos.flatMap((p, step) => (p ? [step] : [])),
        voices: e.voices.map((v) => ({ step: v.step, dur: v.dur, text: v.text, audio: false, ...(v.src ? { src: v.src } : {}) })),
        updatedAt: now - e.daysAgo * 86400000,
        example: true,
      },
    ]),
  );
}
/** Adds only missing example records; never overwrites an existing id. */
export function withExamples(records: Records, now = Date.now()): Records {
  return { ...exampleSeeds(now), ...records };
}

type State = { records: Records; large: boolean; textSize: TextSize; view: Kind; defaultView: Kind };
let state: State = { records: {}, large: false, textSize: 0, view: "topic", defaultView: "topic" };
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  let records = initialRecords(read<Records>(KEY, {}), read<boolean>(EXAMPLES_OPT_IN, false));
  write(KEY, records);
  records = migrate(records);
  const textSize = normalizeTextSize(read<number | null>(SIZE, null) ?? (read(LARGE, false) ? 1 : 0));
  write(SIZE, textSize);
  const defaultView = read<Kind | null>(DEFAULT_VIEW, null);
  state = { records, large: textSize > 0, textSize, view: defaultView ?? read<Kind>(VIEW, "topic"), defaultView: defaultView ?? "topic" };
  applyLarge();
}
/** Older records kept `voice` (sample text) or `audios` (blobs in the media store); move them to `voices`. */
function migrate(records: Records) {
  let dirty = false;
  const out: Records = {};
  for (const [id, r0] of Object.entries(records)) {
    const r = r0 as StoryRecord & { voice?: { step: number; durationSec: number; text: string }; audios?: LegacyClip[] };
    if (!r.voice && !r.audios) {
      out[id] = r;
      continue;
    }
    dirty = true;
    const answers = [...r.answers];
    const voices: Voice[] = [...(r.voices ?? [])];
    if (r.voice) {
      if (!answers[r.voice.step]?.trim()) answers[r.voice.step] = r.voice.text;
      voices.push({ step: r.voice.step, dur: fmtDur(r.voice.durationSec), audio: false });
    }
    for (const c of r.audios ?? []) {
      voices.splice(0, voices.length, ...voices.filter((v) => v.step !== c.step), { step: c.step, dur: fmtDur(c.durationSec), audio: true });
      getMedia(c.id)
        .then((b) => b && putAudio(audioKey(id, c.step), b))
        .then(() => deleteMedia([c.id]))
        .catch(() => {});
    }
    const { voice: _v, audios: _a, ...rest } = r;
    out[id] = { ...rest, answers, voices };
  }
  if (dirty) write(KEY, out);
  return out;
}
function applyLarge() {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("large", state.textSize > 0);
  document.documentElement.classList.remove("xlarge");
}
function set(p: Partial<State>) {
  state = { ...state, ...p };
  listeners.forEach((l) => l());
}

const serverState: State = { records: {}, large: false, textSize: 0, view: "topic", defaultView: "topic" };
export function useStore() {
  return useSyncExternalStore(
    (l) => {
      load();
      listeners.add(l);
      l();
      return () => listeners.delete(l);
    },
    () => (loaded ? state : serverState),
    () => serverState,
  );
}

export const actions = {
  saveRecord(qid: string, r: Omit<StoryRecord, "updatedAt">) {
    const records = { ...state.records, [qid]: { ...r, example: undefined, updatedAt: Date.now() } };
    const ok = write(KEY, records);
    set({ records });
    return ok;
  },
  remove(qids: string[]) {
    const records = { ...state.records };
    qids.forEach((q) => {
      deleteMedia(mediaRefs(records[q]));
      deleteAudio(voiceKeys(q, records[q]));
      delete records[q];
    });
    write(KEY, records);
    set({ records });
  },
  clearExamples() {
    const records = Object.fromEntries(Object.entries(state.records).filter(([, r]) => !r.example));
    write(KEY, records);
    set({ records });
  },
  restoreExamples() {
    const records = withExamples(state.records);
    write(KEY, records);
    write(EXAMPLES_OPT_IN, true);
    prefs.setProfile({ name: "이영숙", birth: "1958", photo: exampleProfilePhoto.url, cover: "ex" });
    set({ records });
  },
  clearAll() {
    write(KEY, {});
    void clearMedia();
    void clearAudio();
    set({ records: {} });
  },
  /** Merges records from a backup file (backup wins on conflicts). */
  importRecords(incoming: Records) {
    const records = { ...state.records, ...incoming };
    write(EXAMPLES_OPT_IN, true);
    const ok = write(KEY, records);
    set({ records });
    return ok;
  },
  /** Floating button: 보통 ↔ 크게. */
  toggleLarge() {
    actions.setTextSize(state.textSize === 0 ? 1 : 0);
  },
  setTextSize(textSize: TextSize) {
    write(SIZE, textSize);
    set({ textSize, large: textSize > 0 });
    applyLarge();
  },
  setDefaultView(defaultView: Kind) {
    write(DEFAULT_VIEW, defaultView);
    write(VIEW, defaultView);
    set({ defaultView, view: defaultView });
  },
  /** Backup restore: replaces every record. */
  replaceRecords(records: Records) {
    write(EXAMPLES_OPT_IN, true);
    const ok = write(KEY, records);
    set({ records });
    return ok;
  },
  setView(view: Kind) {
    write(VIEW, view);
    set({ view });
  },
};

/**
 * Accepts records from a backup made by any version of the app and returns only well-formed ones.
 * Older prototype backups carry a "__v2": true marker, per-step photo arrays with empty slots,
 * and `t` instead of `updatedAt`; without this a restore can stop the app.
 */
export function normalizeRecords(raw: unknown): Records {
  const out: Records = {};
  if (!raw || typeof raw !== "object") return out;
  for (const [id, v] of Object.entries(raw as Record<string, unknown>)) {
    if (!v || typeof v !== "object" || Array.isArray(v)) continue;
    const r = v as Record<string, unknown>;
    if (!Array.isArray(r["answers"])) continue;
    const answers = [0, 1, 2, 3].map((i) => {
      const a = (r["answers"] as unknown[])[i];
      return typeof a === "string" ? a : "";
    });
    const rawPhotos = Array.isArray(r["photos"]) ? (r["photos"] as unknown[]) : [];
    const rawSteps = Array.isArray(r["photoSteps"]) ? (r["photoSteps"] as unknown[]) : null;
    const photos: string[] = [];
    const photoSteps: number[] = [];
    rawPhotos.forEach((p, i) => {
      if (typeof p !== "string" || !p) return;
      photos.push(p);
      const st = rawSteps ? rawSteps[i] : i; // old per-step arrays: the index is the step
      photoSteps.push(typeof st === "number" && st >= 0 && st <= 3 ? st : 0);
    });
    const voices: Voice[] = (Array.isArray(r["voices"]) ? (r["voices"] as unknown[]) : []).flatMap((x) => {
      if (!x || typeof x !== "object") return [];
      const o = x as Record<string, unknown>;
      if (typeof o["step"] !== "number") return [];
      const voice: Voice = { step: o["step"], dur: typeof o["dur"] === "string" ? o["dur"] : "0:00", audio: o["audio"] === true, text: typeof o["text"] === "string" ? o["text"] : undefined };
      if (typeof o["src"] === "string" && o["src"]) voice.src = o["src"];
      return [voice];
    });
    const t = typeof r["updatedAt"] === "number" ? r["updatedAt"] : typeof r["t"] === "number" ? r["t"] : 0;
    const rec: StoryRecord = { answers, updatedAt: t };
    if (photos.length) {
      rec.photos = photos;
      rec.photoSteps = photoSteps;
    } else if (typeof r["photo"] === "string" && r["photo"]) rec.photo = r["photo"];
    if (voices.length) rec.voices = voices;
    if (r["example"] === true) rec.example = true;
    out[id] = rec;
  }
  return out;
}

export function hasContent(r?: StoryRecord) {
  return !!r && ((r.answers ?? []).some((a) => a?.trim()) || !!r.photo || !!r.photos?.length || !!r.voices?.length);
}

export function recordPhotos(r: StoryRecord) {
  return r.photos ?? (r.photo ? [r.photo] : []);
}
export function mediaRefs(r?: StoryRecord) {
  return r ? [...(r.photos ?? [])] : [];
}
export function voiceKeys(id: string, r?: StoryRecord) {
  return (r?.voices ?? []).filter((v) => v.audio).map((v) => audioKey(id, v.step));
}

/** A step counts as filled when it has text, a voice, or (step 0) a photo — photos belong to the first answer. */
export function filledSteps(r?: StoryRecord) {
  if (!r) return [false, false, false, false];
  return [0, 1, 2, 3].map((i) => !!r.answers[i]?.trim() || !!r.voices?.some((v) => v.step === i) || (i === 0 && recordPhotos(r).length > 0));
}
export function isIncomplete(r?: StoryRecord) {
  return hasContent(r) && filledSteps(r).some((f) => !f);
}
