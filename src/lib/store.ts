import { useSyncExternalStore } from "react";
import { EXAMPLE_RECORDS } from "@/data/exampleRecords";
import type { Kind } from "./data";
import { clearMedia, deleteMedia, getMedia } from "./media";
import { audioKey, clearAudio, deleteAudio, fmtDur, putAudio } from "./audio";

/** Per-answer voice metadata; the blob itself lives in IndexedDB under audioKey(recordId, step). */
export type Voice = { step: number; dur: string; audio: boolean; text?: string | undefined };
type LegacyClip = { id: string; durationSec: number; step: number };

export type StoryRecord = {
  answers: string[];
  photo?: string | undefined;
  photos?: string[] | undefined;
  voices?: Voice[] | undefined;
  updatedAt: number;
  example?: boolean | undefined;
};
export type Records = Record<string, StoryRecord>;

const KEY = "mystory.records.v1";
const SEEDED = "mystory.seeded.v10";
const LARGE = "mystory.large.v1";
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

/** Builds one record per EXAMPLE_RECORDS item; voices have no audio file (played as speech synthesis). */
export function exampleSeeds(now = Date.now()): Records {
  return Object.fromEntries(
    EXAMPLE_RECORDS.map((e) => [
      e.id,
      {
        answers: [...e.answers],
        photos: e.photos.filter((p): p is string => !!p),
        voices: e.voices.map((v) => ({ step: v.step, dur: v.dur, text: v.text, audio: false })),
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

type State = { records: Records; large: boolean; view: Kind };
let state: State = { records: {}, large: false, view: "topic" };
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  let records = read<Records>(KEY, {});
  if (!read<boolean>(SEEDED, false)) {
    records = Object.fromEntries(Object.entries(records).filter(([, r]) => !r.example));
    records = withExamples(records);
    write(KEY, records);
    write(SEEDED, true);
  }
  records = migrate(records);
  state = { records, large: read(LARGE, false), view: read<Kind>(VIEW, "topic") };
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
  if (typeof document !== "undefined") document.documentElement.classList.toggle("large", state.large);
}
function set(p: Partial<State>) {
  state = { ...state, ...p };
  listeners.forEach((l) => l());
}

const serverState: State = { records: {}, large: false, view: "topic" };
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
    set({ records });
  },
  clearAll() {
    write(KEY, {});
    clearMedia();
    clearAudio();
    set({ records: {} });
  },
  /** Merges records from a backup file (backup wins on conflicts). */
  importRecords(incoming: Records) {
    const records = { ...state.records, ...incoming };
    const ok = write(KEY, records);
    set({ records });
    return ok;
  },
  toggleLarge() {
    write(LARGE, !state.large);
    set({ large: !state.large });
    applyLarge();
  },
  setView(view: Kind) {
    write(VIEW, view);
    set({ view });
  },
};

export function hasContent(r?: StoryRecord) {
  return !!r && (r.answers.some((a) => a.trim()) || !!r.photo || !!r.photos?.length || !!r.voices?.length);
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
