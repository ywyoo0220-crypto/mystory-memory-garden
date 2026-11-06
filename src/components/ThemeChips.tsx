import { themes } from "@/lib/theme";
import { actions, useStore } from "@/lib/store";

export function ThemeChips({ className = "" }: { className?: string }) {
  const { theme } = useStore();
  return (
    <div role="group" aria-label="배색 비교" className={`flex gap-2 overflow-x-auto [scrollbar-width:none] ${className}`}>
      {themes.map((t) => {
        const on = t.id === theme;
        return (
          <button
            key={t.id}
            type="button"
            aria-pressed={on}
            onClick={() => actions.setTheme(t.id)}
            className="min-h-10 shrink-0 whitespace-nowrap rounded-full border px-4 text-[0.875rem] font-medium"
            style={on ? { background: "#1A1918", color: "#FFFFFF", borderColor: "#1A1918" } : { background: "#FFFFFF", color: "#1A1918", borderColor: "#D9D4CE" }}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}
