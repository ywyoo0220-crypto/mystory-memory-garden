import { describe, expect, it } from "vitest";
import palette from "@/data/themes.json";
import { catVars, themeCss } from "@/lib/theme";
import { allCategories, cardColors } from "@/lib/data";

const names = { background: "bg", text: "text", pill: "pill", pillText: "pill-text", countText: "count-text", buttonBackground: "button-bg", buttonText: "button-text", tint: "tint" };

describe("Final palette", () => {
  const ageBackgrounds = ["#EFFF24", "#BDE9FF", "#E4D1BE", "#D9B5FB", "#9CB8C3", "#FB64F9", "#149CF4", "#515C44", "#004A51"];
  ageBackgrounds.forEach((background, i) => {
    it(`keeps A${i + 1}'s exact lifetime palette with a black pill and white label`, () => {
      const id = `A${i + 1}` as keyof typeof palette.theme.categories;
      const text = i < 7 ? "#000000" : "#FFFFFF";
      const tokens = palette.theme.categories[id];
      expect(tokens.background).toBe(background);
      expect(tokens.text).toBe(text);
      expect(tokens.pill).toBe("#000000");
      expect(tokens.pillText).toBe("#FFFFFF");
      expect(tokens.countText).toBe(text);
    });
  });
  it("exports every supplied token for all 19 categories without changing its value", () => {
    const css = themeCss();
    expect(Object.keys(palette.theme.categories)).toHaveLength(19);
    for (const [id, tokens] of Object.entries(palette.theme.categories))
      for (const [key, value] of Object.entries(tokens)) expect(css).toContain(`--${id}-${names[key as keyof typeof names]}:${value};`);
  });
  it("sets every topic card's text to pure black or white, with a black pill and button", () => {
    const dark = ["T3", "T6", "T8", "T10"];
    for (let i = 1; i <= 10; i++) {
      const id = `T${i}` as keyof typeof palette.theme.categories;
      const tokens = palette.theme.categories[id];
      const text = dark.includes(id) ? "#FFFFFF" : "#000000";
      expect(tokens.text).toBe(text);
      expect(tokens.countText).toBe(text);
      expect(tokens.pill).toBe("#000000");
      expect(tokens.buttonBackground).toBe("#000000");
    }
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
