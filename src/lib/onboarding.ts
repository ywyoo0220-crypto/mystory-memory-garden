import { validBirth } from "./prefs";

export const ONB_KEY = "ms.onb";

/** Optional birth year; a real name is required only for saving the profile. */
export function canSaveOnboardingProfile(name: string, birth: string) {
  return Boolean(name.trim()) && (!birth || validBirth(birth));
}

export function onbDone() {
  try { return !!localStorage.getItem(ONB_KEY); } catch { return true; }
}
export function finishOnb() {
  try { localStorage.setItem(ONB_KEY, String(Date.now())); } catch { /* noop */ }
}
/** Analytics stub for Maze / usability tests. */
export function onbLog(event: string) {
  console.info("[onb]", event);
  const w = window as unknown as { dataLayer?: unknown[] };
  (w.dataLayer ??= []).push({ event });
}
