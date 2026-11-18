import { clearAudio } from "./audio";
import { clearMedia } from "./media";

/** Every key this app keeps in localStorage starts with one of these. */
const PREFIXES = ["mystory.", "ms."];

/**
 * Returns the app to a first-install state on this device: records, photos, voices,
 * name and birth year, app lock, shares, onboarding and every setting. Used to hand the
 * phone to the next person (exhibition, demo). The caller reloads the page afterwards.
 */
export async function resetApp() {
  await Promise.all([clearMedia(), clearAudio()]);
  try {
    const keys = Array.from({ length: localStorage.length }, (_, i) => localStorage.key(i) ?? "");
    keys
      .filter((k) => PREFIXES.some((p) => k.startsWith(p)))
      .forEach((k) => localStorage.removeItem(k));
  } catch {
    /* Storage unavailable: nothing was kept there either. */
  }
  try {
    sessionStorage.clear();
  } catch {
    /* noop */
  }
}
