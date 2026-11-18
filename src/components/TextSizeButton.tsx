import { actions, useStore } from "@/lib/store";

/**
 * The 크게/보통 switch. One rule for its place: always the bottom-right of the screen —
 * beside the menu where there is one, and at the right end of the bottom button where there isn't.
 */
export function TextSizeButton({ className = "size-14" }: { className?: string }) {
  const { large } = useStore();
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
