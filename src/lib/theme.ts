import raw from "@/data/themes.json";

type Tokens = {
  background: string; text: string; pill: string; pillText: string;
  countText: string; buttonBackground: string; buttonText: string; tint: string;
};
const data = raw as unknown as { theme: { label: string; categories: Record<string, Tokens> } };

const MAP: [keyof Tokens, string][] = [
  ["background", "bg"],
  ["text", "text"],
  ["pill", "pill"],
  ["pillText", "pill-text"],
  ["countText", "count-text"],
  ["buttonBackground", "button-bg"],
  ["buttonText", "button-text"],
  ["tint", "tint"],
];

/** Global stylesheet: the single palette's tokens per category as --{catId}-{token}. */
export function themeCss() {
  const vars = Object.entries(data.theme.categories)
    .flatMap(([cat, t]) => MAP.map(([k, n]) => `--${cat}-${n}:${t[k]};`))
    .join("");
  return `:root{${vars}}`;
}

/** Per-card CSS variables pointing at a category's tokens. */
export function catVars(catId: string) {
  return { ...Object.fromEntries(MAP.map(([, n]) => [`--cat-${n}`, `var(--${catId}-${n})`])), "--ring": `var(--${catId}-text)` } as Record<string, string>;
}
