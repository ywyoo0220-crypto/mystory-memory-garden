import type { Kind } from "@/lib/data";

export function ViewToggle({ value, onChange }: { value: Kind; onChange: (k: Kind) => void }) {
  const opts: [Kind, string][] = [
    ["topic", "주제별"],
    ["period", "시간순"],
  ];
  return (
    <div role="group" aria-label="보기 방식" className="flex rounded-full border border-ink p-1">
      {opts.map(([k, label]) => (
        <button
          key={k}
          type="button"
          aria-pressed={value === k}
          onClick={() => onChange(k)}
          className={`h-12 rounded-full px-4 [.large_&]:px-4 text-caption font-medium transition-colors ${
            value === k ? "bg-ink text-ink-foreground" : "text-foreground"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
