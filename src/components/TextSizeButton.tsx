import { useSyncExternalStore } from "react";
import { actions, useStore } from "@/lib/store";

const KEY = "mystory.sizebtn.hidden.v1";
const ls = new Set<() => void>();
function readHidden() {
  try { return localStorage.getItem(KEY) === "1"; } catch { return false; }
}
/** Whether the floating 크게/보통 button is hidden (MY > 설정). Shown by default. */
export function useSizeButtonHidden() {
  return useSyncExternalStore((l) => { ls.add(l); return () => ls.delete(l); }, readHidden, () => false);
}
export function setSizeButtonHidden(hidden: boolean) {
  try { if (hidden) localStorage.setItem(KEY, "1"); else localStorage.removeItem(KEY); } catch { /* noop */ }
  ls.forEach((l) => l());
}

/**
 * The 크게/보통 switch. One rule for its place: always the bottom-right of the screen —
 * beside the menu where there is one, and at the right end of the bottom button where there isn't.
 */
export function TextSizeButton({ className = "size-14" }: { className?: string }) {
  const { large } = useStore();
  const hidden = useSizeButtonHidden();
  if (hidden) return null;
  return (
    <button
      type="button"
      onClick={actions.toggleLarge}
      aria-pressed={large}
      aria-label="글자 크게 보기"
      className={`flex shrink-0 items-center justify-center rounded-full bg-ink text-caption font-medium text-ink-foreground ${className}`}
    >
      {large ? "보통" : "크게"}
    </button>
  );
}
