import { useSyncExternalStore } from "react";
import notebook from "@/assets/seed-notebook.jpg";
import house from "@/assets/seed-house.jpg";
import type { Kind } from "./data";

export type StoryRecord = {
  answers: string[];
  photo?: string | undefined;
  voice?: { step: number; durationSec: number; text: string } | undefined;
  updatedAt: number;
  example?: boolean | undefined;
};
export type Records = Record<string, StoryRecord>;

const KEY = "mystory.records.v1";
const SEEDED = "mystory.seeded.v1";
const LARGE = "mystory.large.v1";
const VIEW = "mystory.view.v1";

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

const seeds: Records = {
  "T1-Q1": {
    answers: [
      "젊었을 때 다니던 직장을 그만두고 작은 가게를 시작했을 때. 처음에는 두려움이 컸지만 그 일을 계기로 제 힘으로 삶을 꾸려나간다는 책임감을 배우게 되었지.",
      "서른다섯 살 봄이었어요. 아이들이 아직 어렸지요.",
      "남편이 제일 반대했는데, 결국 가게 간판은 남편이 직접 달아 주었어요.",
      "새벽 다섯 시에 일어나는 사람이 되었어요. 힘들었지만 내 이름으로 된 무언가가 생겼다는 게 좋았어요.",
    ],
    photo: notebook,
    updatedAt: 1,
    example: true,
  },
  "T2-Q1": {
    answers: [
      "늘 북적였어요. 할머니, 삼촌들까지 한 집에 살았으니까요.",
      "겨울이면 마당에 김장독을 묻고 온 식구가 모여 배추를 절이던 장면.",
      "어머니요. 말씀은 적었지만 집안의 중심이었어요.",
      "",
    ],
    photo: house,
    updatedAt: 2,
    example: true,
  },
  "T7-Q1": {
    answers: ["", "", "", ""],
    voice: {
      step: 0,
      durationSec: 18,
      text: "고등학교 때 짝꿍이었던 영숙이. 힘든 시절마다 먼저 전화를 걸어 준 사람이에요.",
    },
    updatedAt: 3,
    example: true,
  },
  "T10-Q1": {
    answers: [
      "아버지와의 이별이요. 마지막으로 손을 잡았던 감촉이 아직도 기억나요.",
      "",
      "",
      "",
    ],
    updatedAt: 4,
    example: true,
  },
  "A1-Q1": {
    answers: [
      "동네 골목에서 고무줄놀이를 제일 많이 했어요. 해 질 녘까지 놀다가 어머니가 부르는 소리에 들어갔지요.",
      "",
      "",
      "",
    ],
    updatedAt: 5,
    example: true,
  },
  "A3-Q1": {
    answers: [
      "",
      "",
      "",
      "",
    ],
    voice: {
      step: 0,
      durationSec: 24,
      text: "스물넷에 서울로 올라온 것. 아무도 없는 곳에서 혼자 시작해 보겠다고 마음먹었어요.",
    },
    updatedAt: 6,
    example: true,
  },
  "A6-Q1": {
    answers: ["쉰이 넘어 서예를 배우기 시작했어요. 먹을 갈 때 마음이 차분해져요.", "", "", ""],
    updatedAt: 7,
    example: true,
  },
};

type State = { records: Records; large: boolean; view: Kind };
let state: State = { records: {}, large: false, view: "topic" };
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  let records = read<Records>(KEY, {});
  if (!read<boolean>(SEEDED, false)) {
    records = { ...seeds, ...records };
    write(KEY, records);
    write(SEEDED, true);
  }
  state = { records, large: read(LARGE, false), view: read<Kind>(VIEW, "topic") };
  applyLarge();
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
    qids.forEach((q) => delete records[q]);
    write(KEY, records);
    set({ records });
  },
  clearExamples() {
    const records = Object.fromEntries(Object.entries(state.records).filter(([, r]) => !r.example));
    write(KEY, records);
    set({ records });
  },
  clearAll() {
    write(KEY, {});
    set({ records: {} });
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
  return !!r && (r.answers.some((a) => a.trim()) || !!r.photo || !!r.voice);
}
