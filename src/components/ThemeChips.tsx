import { themes } from "@/lib/theme";
import { useTheme } from "./ThemeProvider";
import { Button } from "./ui/button";

export function ThemeChips({ className = "" }: { className?: string }) {
  const { activeTheme, setTheme } = useTheme();
  return (
    <div role="group" aria-label="배색 비교" className={`flex gap-2 overflow-x-auto [scrollbar-width:none] ${className}`}>
      {themes.map((t) => {
        const on = t.id === activeTheme;
        return (
          <Button
            variant="palette"
            key={t.id}
            type="button"
            aria-pressed={on}
            onClick={() => setTheme(t.id)}
            className={`min-h-10 shrink-0 whitespace-nowrap rounded-full border px-4 text-[0.875rem] font-medium ${on ? "border-ink bg-ink text-ink-foreground" : "border-comparison-border bg-card text-ink"}`}
          >
            {t.label}
          </Button>
        );
      })}
    </div>
  );
}
