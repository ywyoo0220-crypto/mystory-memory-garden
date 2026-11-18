import { describe, expect, it } from "vitest";
import { hasContent, normalizeRecords } from "@/lib/store";

describe("normalizeRecords", () => {
  it("reads an old prototype backup without breaking", () => {
    const old = {
      __v2: true,
      "T1-Q1": {
        answers: ["첫 답", "", "셋째", "넷째"],
        photos: [null, null, null, "data:image/jpeg;base64,AAAA"],
        voices: [{ step: 2, dur: "0:36", text: "말한 내용" }],
        t: 1791802800000,
        ex: false,
      },
    };
    const r = normalizeRecords(old);
    expect(Object.keys(r)).toEqual(["T1-Q1"]);
    expect(r["T1-Q1"]).toMatchObject({
      answers: ["첫 답", "", "셋째", "넷째"],
      photos: ["data:image/jpeg;base64,AAAA"],
      photoSteps: [3],
      voices: [{ step: 2, dur: "0:36", audio: false, text: "말한 내용" }],
      updatedAt: 1791802800000,
    });
    expect(hasContent(r["T1-Q1"])).toBe(true);
  });
  it("keeps current backups as they are", () => {
    const cur = {
      "A1-Q2": { answers: ["a", "b", "", ""], photos: ["idb:x"], photoSteps: [1], updatedAt: 5 },
    };
    expect(normalizeRecords(cur)).toEqual({
      "A1-Q2": { answers: ["a", "b", "", ""], photos: ["idb:x"], photoSteps: [1], updatedAt: 5 },
    });
  });
  it("drops entries that are not records", () => {
    expect(normalizeRecords({ a: 1, b: null, c: { answers: "x" }, d: [1] })).toEqual({});
  });
});
