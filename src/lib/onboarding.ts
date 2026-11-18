import { validBirth } from "./prefs";

export const ONB_KEY = "ms.onb";

export type OnboardingMode = "first" | "help";

/** Keep old screen URLs valid while removing profile setup from the tour. */
export function onboardingStep(step: number, mode: OnboardingMode) {
  if (mode === "help") return Math.min(step, 3);
  return step === 4 ? 5 : step;
}

export function nextOnboardingStep(step: number, mode: OnboardingMode) {
  const steps = mode === "help" ? [1, 2, 3] : [1, 2, 3, 5];
  return steps[steps.indexOf(step) + 1];
}

export function previousOnboardingStep(step: number, mode: OnboardingMode) {
  const steps = mode === "help" ? [1, 2, 3] : [1, 2, 3, 5];
  return steps[steps.indexOf(step) - 1];
}

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
