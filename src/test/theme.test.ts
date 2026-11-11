import { describe, expect, it } from "vitest";
import palette from "@/data/themes.json";
import { catVars, themeCss } from "@/lib/theme";
import { allCategories, cardColors } from "@/lib/data";

const names = { background: "bg", text: "text", pill: "pill", pillText: "pill-text", countText: "count-text", buttonBackground: "button-bg", buttonText: "button-text", tint: "tint" };

describe("Final palette", () => {
  it("exports every supplied token for all 19 categories without changing its value", () => {
    const css = themeCss();
    expect(Object.keys(palette.theme.categories)).toHaveLength(19);
    for (const [id, tokens] of Object.entries(palette.theme.categories))
      for (const [key, value] of Object.entries(tokens)) expect(css).toContain(`--${id}-${names[key as keyof typeof names]}:${value};`);
  });
  it("keeps 사랑과 증오 text pure black", () => {
    expect(palette.theme.categories.T4.text).toBe("#000000");
  });
  it("uses buttonBackground/buttonText for the filled button and countText for the count pill", () => {
    for (const cat of allCategories) {
      const c = cardColors(cat);
      expect(c.btnBg).toBe(`var(--${cat.id}-button-bg)`);
      expect(c.btnFg).toBe(`var(--${cat.id}-button-text)`);
      expect(c.count).toBe(`var(--${cat.id}-count-text)`);
      expect(catVars(cat.id)["--ring"]).toBe(`var(--${cat.id}-text)`);
    }
  });
});
