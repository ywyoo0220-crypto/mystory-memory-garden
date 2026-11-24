import { useSyncExternalStore } from "react";

/**
 * The app runs on phones, tablets and laptops. Layout follows the width (see --app-w in styles.css);
 * the wording follows the device, so "이 휴대폰에만 저장돼요" reads "이 태블릿에만" or "이 컴퓨터에만" elsewhere.
 */
export type DeviceKind = "phone" | "tablet" | "computer";

export const DEVICE_NAME: Record<DeviceKind, string> = { phone: "휴대폰", tablet: "태블릿", computer: "컴퓨터" };

/** Phone if the browser says mobile; otherwise a touch-first screen is a tablet and the rest are computers. */
export function detectDevice(ua: string, coarsePointer: boolean, touchPoints = 0): DeviceKind {
  if (/iPad|Tablet/i.test(ua)) return "tablet";
  if (/Mobi|iPhone|iPod/i.test(ua)) return "phone";
  // iPadOS Safari reports itself as a Mac; a Mac with several touch points is an iPad.
  if (/Macintosh/i.test(ua) && touchPoints > 1) return "tablet";
  if (/Android/i.test(ua)) return "tablet";
  return coarsePointer ? "tablet" : "computer";
}

function current(): DeviceKind {
  if (typeof navigator === "undefined" || typeof window === "undefined") return "phone";
  const coarse = typeof window.matchMedia === "function" && window.matchMedia("(pointer: coarse)").matches;
  return detectDevice(navigator.userAgent ?? "", coarse, navigator.maxTouchPoints ?? 0);
}

const noop = () => () => {};

/** Phone on the server and during hydration, the real device right after. */
export function useDevice(): DeviceKind {
  return useSyncExternalStore(noop, current, () => "phone");
}

/** "휴대폰" | "태블릿" | "컴퓨터" for the device the app is open on. */
export function useDeviceName(): string {
  return DEVICE_NAME[useDevice()];
}

/** Picks the particle by the last syllable: josa("휴대폰", "과", "와") → "과", josa("컴퓨터", "으로", "로") → "로". */
export function josa(word: string, afterConsonant: string, afterVowel: string): string {
  const code = word.charCodeAt(word.length - 1) - 0xac00;
  if (code < 0 || code > 11171) return afterConsonant;
  const final = code % 28;
  // "으로/로": a final ㄹ also takes "로" (연필로).
  if (afterConsonant === "으로" && final === 8) return afterVowel;
  return final === 0 ? afterVowel : afterConsonant;
}

/** Follows a media query; false on the server and during hydration. */
export function useMedia(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const mq = window.matchMedia(query);
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    () => typeof window.matchMedia === "function" && window.matchMedia(query).matches,
    () => false,
  );
}

/** Laptop width: the same query as the `desk:` breakpoint in styles.css, so layout and markup switch together. */
export const DESK_QUERY = "(min-width: 64rem)";
