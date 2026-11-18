import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** "11월 12일" — the day a record was last written. */
export function dateLabel(t: number) {
  const d = new Date(t);
  return `${d.getMonth() + 1}월 ${d.getDate()}일`;
}
