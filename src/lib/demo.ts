// Exhibition try-out devices (?demo=1): photos come from a fixed set of persona photos instead of the
// device library, and sending, printing and backup files are off, so a lent personal iPad shows nothing of its owner.
// The flag is kept in localStorage so the home-screen app stays in this mode; ?demo=0 turns it off.
const KEY = "mystory.demo.v1";
type Store = Pick<Storage, "getItem" | "setItem" | "removeItem">;

export function resolveDemo(search: string, store: Store): boolean {
  const q = new URLSearchParams(search).get("demo");
  try {
    if (q === "1") store.setItem(KEY, "1");
    else if (q === "0") store.removeItem(KEY);
    return store.getItem(KEY) === "1";
  } catch {
    return q === "1";
  }
}

let on: boolean | null = null;
export function isDemo(): boolean {
  if (on === null) {
    try { on = typeof window !== "undefined" && resolveDemo(window.location.search, localStorage); } catch { on = false; }
  }
  return on;
}
// Read the address at start-up, before first-run redirects drop ?demo=1.
if (typeof window !== "undefined") isDemo();

export const DEMO_PHOTOS = Array.from({ length: 15 }, (_, i) => `/demo/demo-${String(i + 1).padStart(2, "0")}.jpg`);
export const DEMO_BLOCKED = "체험용 기기에서는 쓸 수 없는 기능이에요.";

type Request = { multiple: boolean; resolve: (files: File[]) => void };
let listener: ((r: Request) => void) | null = null;
/** Mounted once by DemoPhotoSheet. */
export function onDemoPhotoRequest(fn: ((r: Request) => void) | null) { listener = fn; }

/** Opens the in-app photo set and resolves with the chosen photos as files (empty if closed). */
export function pickDemoPhotos(multiple: boolean): Promise<File[]> {
  return new Promise((resolve) => (listener ? listener({ multiple, resolve }) : resolve([])));
}

export async function demoPhotoFiles(srcs: string[]): Promise<File[]> {
  const out: File[] = [];
  for (const src of srcs) {
    const b = await fetch(src).then((r) => r.blob());
    out.push(new File([b], src.split("/").pop() || "photo.jpg", { type: b.type || "image/jpeg" }));
  }
  return out;
}

/** Opens the demo set in demo mode, otherwise the given file input. */
export function openPhotoPicker(input: HTMLInputElement | null, multiple: boolean, use: (files: File[]) => void) {
  if (isDemo()) void pickDemoPhotos(multiple).then((f) => f.length && use(f));
  else input?.click();
}
