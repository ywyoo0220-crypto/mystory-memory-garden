import { describe, expect, it } from "vitest";
import { getPrefs, hashPin, periodYears, prefs, validBirth } from "@/lib/prefs";
import { filledSteps, isIncomplete } from "@/lib/store";

describe("MY rules", () => {
  it("stores device-only share settings without a link for family and link scopes", () => {
    getPrefs();
    for (const scope of ["family", "link"] as const) {
      prefs.addShare({ id: `test-${scope}`, scope, qids: ["T1-Q1"], withVoice: false, t: 1 });
      const saved = JSON.parse(localStorage.getItem("mystory.shares.v1") ?? "[]");
      expect(saved[0]).toEqual({ id: `test-${scope}`, scope, qids: ["T1-Q1"], withVoice: false, t: 1 });
      expect(saved[0]).not.toHaveProperty("link");
    }
    prefs.removeShares();
  });
  it("period years from birth year", () => {
    expect(periodYears("1955", 0)).toBe("1955–1964");
    expect(periodYears("1955", 2)).toBe("1975–1984");
    expect(periodYears("1955", 8)).toBe("2035–");
    expect(periodYears("", 2)).toBe("");
  });
  it("birth year must be 1900–2099", () => {
    expect(validBirth("1899")).toBe(false);
    expect(validBirth("1955")).toBe(true);
    expect(validBirth("2100")).toBe(false);
    expect(validBirth("55")).toBe(false);
  });
  it("PIN is stored hashed", async () => {
    const h = await hashPin("1234");
    expect(h).not.toContain("1234");
    expect(h).toHaveLength(64);
  });
  it("a step with text, voice or photo counts as filled", () => {
    const r = { answers: ["", "", "글", ""], photos: ["/p.jpg"], voices: [{ step: 1, dur: "0:10", audio: false }], updatedAt: 1 };
    expect(filledSteps(r)).toEqual([true, true, true, false]);
    expect(isIncomplete(r)).toBe(true);
  });
});
