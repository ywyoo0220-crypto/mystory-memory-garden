import { describe, expect, it } from "vitest";
import { actions, initialRecords, normalizeTextSize, withExamples } from "@/lib/store";
import { getPrefs } from "@/lib/prefs";
import photo from "@/assets/example-profile.png.asset.json";

describe("Prototype usability rules", () => {
  it("starts with no examples in empty storage", () => {
    expect(initialRecords({}, false)).toEqual({});
  });
  it("removes previously automatic examples while keeping personal records", () => {
    const mine = { answers: ["내 기록", "", "", ""], updatedAt: 1 };
    expect(initialRecords(withExamples({ "T2-Q1": mine }), false)).toEqual({ "T2-Q1": mine });
  });
  it("keeps examples after explicitly opting in", () => {
    const records = withExamples({});
    expect(Object.keys(initialRecords(records, true))).toHaveLength(8);
  });
  it("does not create a sample profile before loading examples", () => {
    expect(getPrefs().profile).toEqual({ name: "", birth: "" });
  });
  it("sets the supplied sample profile only when examples are loaded", () => {
    actions.restoreExamples();
    expect(getPrefs().profile).toEqual({ name: "김정희", birth: "1960", photo: photo.url });
  });
  it("supports only normal and large, mapping legacy very large to large", () => {
    expect([0, 1, 2].map(normalizeTextSize)).toEqual([0, 1, 1]);
  });
});