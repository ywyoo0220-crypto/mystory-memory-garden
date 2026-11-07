import raw from "@/data/themes.json";

type Tokens = { background: string; text: string; pill: string; pillText: string; buttonText: string; tint: string };
const data = raw as unknown as { themes: Record<string, { label: string; categories: Record<string, Tokens> }> };

export const THEME_IDS = ["G", "H", "I", "J", "K"] as const;
export type ThemeId = (typeof THEME_IDS)[number];
export const DEFAULT_THEME: ThemeId = "G";
export const themes = THEME_IDS.map((id) => ({ id, label: data.themes[id]?.label ?? id }));
export function isThemeId(v: unknown): v is ThemeId {
  return typeof v === "string" && (THEME_IDS as readonly string[]).includes(v);
}

const MAP: [keyof Tokens, string][] = [
  ["background", "bg"],
  ["text", "text"],
  ["pill", "pill"],
  ["pillText", "pill-text"],
  ["buttonText", "button-text"],
  ["tint", "tint"],
];

/** Global stylesheet: every theme's tokens per category as --{catId}-{token}, switched by html[data-theme]. */
export function themeCss() {
  return THEME_IDS.map((id) => {
    const sel = id === DEFAULT_THEME ? `html:not([data-theme]),html[data-theme="${id}"]` : `html[data-theme="${id}"]`;
    const vars = Object.entries(data.themes[id]?.categories ?? {})
      .flatMap(([cat, t]) => MAP.map(([k, n]) => `--${cat}-${n}:${t[k]};`))
      .join("");
    return `${sel}{${vars}}`;
  }).join("\n");
}

/** Per-card CSS variables pointing at the active theme's tokens for a category. */
export function catVars(catId: string) {
  return { ...Object.fromEntries(MAP.map(([, n]) => [`--cat-${n}`, `var(--${catId}-${n})`])), "--ring": `var(--${catId}-text)` } as Record<string, string>;
}
