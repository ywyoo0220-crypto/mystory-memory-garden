import { actions, useStore, type TextSize } from "@/lib/store";

/**
 * 보통 / 크게 as two tiles, each label set in the size it gives, with a check on the chosen one.
 * Used in onboarding (first choice) and in MY > 설정, so both places look and behave the same.
 */
export function TextSizeChoice({ labelledBy }: { labelledBy: string }) {
  const { textSize } = useStore();
  const opts = [
    [0, "보통", "text-body"],
    [1, "크게", "text-title"],
  ] as const;
  return (
    <div role="radiogroup" aria-labelledby={labelledBy} className="grid grid-cols-2 gap-2">
      {opts.map(([v, name, size]) => {
        const on = textSize === v;
        return (
          <button
            key={v}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => actions.setTextSize(v as TextSize)}
            className={`relative flex min-h-[6rem] flex-col items-center justify-center rounded-2xl border-2 bg-card text-foreground transition-colors ${on ? "border-ink" : "border-border"}`}
          >
            <span
              aria-hidden
              className={`absolute right-2.5 top-2.5 flex size-[1.375rem] items-center justify-center rounded-full ${on ? "bg-ink text-ink-foreground" : "border-2 border-border"}`}
            >
              {on && (
                <svg viewBox="0 0 24 24" className="size-[0.875rem]" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12.5l4.5 4.5L19 7.5" />
                </svg>
              )}
            </span>
            <span className={`${size} font-medium`}>{name}</span>
          </button>
        );
      })}
    </div>
  );
}
