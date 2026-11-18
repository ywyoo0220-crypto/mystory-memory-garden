import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * The app's three type tokens are font sizes. Without this, tailwind-merge reads them as text
 * colours, keeps the shared Button's text-sm alongside, and buttons render at 14.9px.
 */
const twMerge = extendTailwindMerge({
  extend: { classGroups: { "font-size": [{ text: ["title", "body", "caption"] }] } },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
/** "11월 12일" — the day a record was last written. */
export function dateLabel(t: number) {
  const d = new Date(t);
  return `${d.getMonth() + 1}월 ${d.getDate()}일`;
}
