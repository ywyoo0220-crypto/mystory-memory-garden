import { useSyncExternalStore } from "react";

/** Profile, MY settings, local shares and the app-lock PIN hash; all on this device only. */
export type Profile = { name: string; birth: string; photo?: string | undefined; cover?: string | undefined; coverUp?: string | undefined };
export type ShareScope = "me" | "family" | "link";
export type Share = { id: string; qids: string[]; scope: ShareScope; withVoice: boolean; t: number; link?: string | undefined };
type Prefs = { profile: Profile; shares: Share[]; pinHash: string | null };

const K = {
  profile: "mystory.profile.v1",
  shares: "mystory.shares.v1",
  pin: "mystory.pin.v1",
};
const empty: Prefs = { profile: { name: "", birth: "" }, shares: [], pinHash: null };

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

let state = empty;
let loaded = false;
const ls = new Set<() => void>();
function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  state = {
    profile: read(K.profile, empty.profile),
    shares: read(K.shares, []),
    pinHash: read<string | null>(K.pin, null),
  };
}
function set(p: Partial<Prefs>) {
  state = { ...state, ...p };
  ls.forEach((l) => l());
}
export function usePrefs() {
  return useSyncExternalStore(
    (l) => {
      load();
      ls.add(l);
      l();
      return () => ls.delete(l);
    },
    () => (loaded ? state : empty),
    () => empty,
  );
}
export function getPrefs() {
  load();
  return state;
}

export const prefs = {
  setProfile(profile: Profile) {
    const ok = write(K.profile, profile);
    if (ok) set({ profile });
    return ok;
  },
  addShare(s: Share) {
    const shares = [s, ...state.shares];
    write(K.shares, shares);
    set({ shares });
  },
  removeShares(ids?: string[]) {
    const shares = ids ? state.shares.filter((s) => !ids.includes(s.id)) : [];
    write(K.shares, shares);
    set({ shares });
  },
  async setPin(pin: string | null) {
    const pinHash = pin ? await hashPin(pin) : null;
    if (pinHash) write(K.pin, pinHash);
    else localStorage.removeItem(K.pin);
    set({ pinHash });
  },
};

/** SHA-256 of a fixed app salt + PIN; the PIN itself is never stored. */
export async function hashPin(pin: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`myStory-lock:${pin}`));
  return Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, "0")).join("");
}
export async function checkPin(pin: string) {
  return !!state.pinHash && (await hashPin(pin)) === state.pinHash;
}

/** Year range for a life period index (0 = 유년기 … 8 = 80대 이후). */
export function periodYears(birth: string, index: number) {
  const b = Number(birth);
  if (!/^\d{4}$/.test(birth) || b < 1900 || b > 2099) return "";
  const s = b + index * 10;
  return index >= 8 ? `${s}–` : `${s}–${s + 9}`;
}
export const validBirth = (b: string) => /^\d{4}$/.test(b) && Number(b) >= 1900 && Number(b) <= 2099;

export const SCOPES: [ShareScope, string, string][] = [
  ["me", "나만 보기", "공유하지 않고 내 휴대폰에만 둬요"],
  ["family", "가족에게만", "내가 고른 가족만 볼 수 있어요"],
  ["link", "링크를 받은 사람", "링크를 아는 사람은 누구나 볼 수 있어요"],
];
