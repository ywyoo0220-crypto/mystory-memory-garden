import { useSyncExternalStore } from "react";
import notebook from "@/assets/seed-notebook.jpg";
import house from "@/assets/seed-house.jpg";
import type { Kind } from "./data";
import { DEFAULT_THEME, isThemeId, type ThemeId } from "./theme";

export type StoryRecord = {
  answers: string[];
  photo?: string | undefined;
  voice?: { step: number; durationSec: number; text: string } | undefined;
  updatedAt: number;
  example?: boolean | undefined;
};
export type Records = Record<string, StoryRecord>;

const KEY = "mystory.records.v1";
const SEEDED = "mystory.seeded.v6";
const THEME = "mystory.theme";
const HIDE_CHIPS = "mystory.hideThemeChips";
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
  "T10-Q1": {
    answers: [
      "열아홉에 학교를 마치고 서울로 올라갈 때요. 매일 같이 다니던 친구와 헤어진 게 첫 이별이었어요.",
      "기차 역에서 손만 흔들고 돌아섰는데, 그 뒤로 연락이 자연히 끊겼어요.",
      "서운함보다 내가 먼저 떠났다는 마음이 더 컸어요.",
      "그래서 인연은 붙잡는 게 아니라 자주 안부 묻는 거라고 배웠어요.",
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
  "T9-Q1": {
    answers: ["정직이요. 손해를 보더라도 떳떳하게 사는 게 결국 남는 거라고 배웠어요.", "", "", ""],
    updatedAt: 3,
    example: true,
  },
  "T6-Q1": {
    answers: ["", "", "", ""],
    voice: {
      step: 0,
      durationSec: 18,
      text: "외환위기 때요. 가게 문을 닫을까 매일 고민했지만, 식구들 덕분에 버텼어요.",
    },
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
  "T5-Q1": {
    answers: ["대체로 건강한 편이었어요. 감기 한 번 걸리면 오래가긴 했지만요.", "", "", ""],
    updatedAt: 8,
    example: true,
  },
  "A5-Q1": {
    answers: ["마흔이 되어 오래 미뤄 두었던 공부를 다시 시작했어요.", "", "", ""],
    updatedAt: 11,
    example: true,
  },
  "A4-Q1": {
    answers: ["첫아이가 태어난 해요. 모든 게 처음이라 서툴렀지만 가장 단단해진 시기였어요.", "", "", ""],
    updatedAt: 9,
    example: true,
  },
  "A8-Q1": {
    answers: ["칠순 잔치에 흩어져 살던 형제들이 모두 모였어요. 다 같이 찍은 사진을 지금도 머리맡에 두어요.", "", "", ""],
    updatedAt: 10,
    example: true,
  },
  "A6-Q1": {
    answers: ["쉰이 넘어 서예를 배우기 시작했어요. 먹을 갈 때 마음이 차분해져요.", "", "", ""],
    updatedAt: 7,
    example: true,
  },
};

type State = { records: Records; large: boolean; view: Kind; theme: ThemeId; hideChips: boolean };
let state: State = { records: {}, large: false, view: "topic", theme: DEFAULT_THEME, hideChips: false };
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  let records = read<Records>(KEY, {});
  if (!read<boolean>(SEEDED, false)) {
    records = Object.fromEntries(Object.entries(records).filter(([, r]) => !r.example));
    records = { ...seeds, ...records };
    write(KEY, records);
    write(SEEDED, true);
  }
  const t = read<unknown>(THEME, DEFAULT_THEME);
  state = { records, large: read(LARGE, false), view: read<Kind>(VIEW, "topic"), theme: isThemeId(t) ? t : DEFAULT_THEME, hideChips: read(HIDE_CHIPS, false) };
  applyLarge();
  applyTheme();
}
function applyLarge() {
  if (typeof document !== "undefined") document.documentElement.classList.toggle("large", state.large);
}
function applyTheme() {
  if (typeof document !== "undefined") document.documentElement.dataset["theme"] = state.theme;
}
function set(p: Partial<State>) {
  state = { ...state, ...p };
  listeners.forEach((l) => l());
}

const serverState: State = { records: {}, large: false, view: "topic", theme: DEFAULT_THEME, hideChips: false };
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
  setTheme(theme: ThemeId) {
    write(THEME, theme);
    set({ theme });
    applyTheme();
  },
  toggleHideChips() {
    write(HIDE_CHIPS, !state.hideChips);
    set({ hideChips: !state.hideChips });
  },
  setView(view: Kind) {
    write(VIEW, view);
    set({ view });
  },
};

export function hasContent(r?: StoryRecord) {
  return !!r && (r.answers.some((a) => a.trim()) || !!r.photo || !!r.voice);
}
