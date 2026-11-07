import { describe, expect, it } from "vitest";
import palettes from "@/data/themes.json";
import { DEFAULT_THEME, THEME_IDS, catVars, isThemeId, themeCss } from "@/lib/theme";
import { allCategories, cardColors, getCategory } from "@/lib/data";

describe("Exact palette rules", () => {
  it("offers only G H I J K with G as default", () => {
    expect(THEME_IDS).toEqual(["G", "H", "I", "J", "K"]);
    expect(DEFAULT_THEME).toBe("G");
    for (const old of ["current", "B", "E"]) expect(isThemeId(old)).toBe(false);
  });
  it("exports every supplied token without changing its value", () => {
    const css = themeCss();
    const names = { background: "bg", text: "text", pill: "pill", pillText: "pill-text", buttonText: "button-text", tint: "tint" };
    for (const theme of Object.values(palettes.themes)) {
      expect(Object.keys(theme.categories)).toHaveLength(19);
      for (const [id, tokens] of Object.entries(theme.categories)) {
        for (const [key, value] of Object.entries(tokens)) {
          expect(css).toContain(`--${id}-${names[key as keyof typeof names]}:${value};`);
        }
      }
    }
  });
  it("uses text for filled surfaces and buttonText for their labels", () => {
    for (const cat of allCategories) {
      expect(cardColors(cat).btnBg).toBe(`var(--${cat.id}-text)`);
      expect(cardColors(cat).btnFg).toBe(`var(--${cat.id}-button-text)`);
      expect(catVars(cat.id)["--cat-pill-text"]).toBe(`var(--${cat.id}-pill-text)`);
    }
  });
  it("keeps the provided 70대 question available for comparison examples", () => {
    expect(getCategory("A8")?.questions[0]?.core).toBe("70대의 당신에게 가장 큰 사건이나 경험은 무엇이었나요?");
  });
});