import { describe, expect, it, vi } from "vitest";
vi.mock("@/assets/mystory_wordmark.png.asset.json", () => ({ default: { url: "" } }));
import { homeCards } from "@/routes/index";
import { exampleSeeds, withExamples } from "@/lib/store";

describe("Example records", () => {
  const now = Date.UTC(2026, 10, 12);
  it("주제별 order", () => {
    expect(homeCards(exampleSeeds(now), "topic").map((c) => c.qid)).toEqual(["T7-Q2", "T1-Q1", "T8-Q3", "T2-Q1", "T10-Q2"]);
  });
  it("시기별 order", () => {
    expect(homeCards(exampleSeeds(now), "period").map((c) => c.qid)).toEqual(["A1-Q3", "A3-Q4", "A6-Q3"]);
  });
  it("t = now - daysAgo days, ex true, no audio", () => {
    const r = exampleSeeds(now)["T10-Q2"]!;
    expect(r.updatedAt).toBe(now - 10 * 86400000);
    expect(r.example).toBe(true);
    expect(exampleSeeds(now)["A1-Q3"]!.voices).toEqual([{ step: 1, dur: "0:52", audio: false, text: expect.any(String) }]);
  });
  it("only T1-Q1 has a photo", () => {
    expect(Object.entries(exampleSeeds(now)).filter(([, r]) => r.photos?.length).map(([k, r]) => [k, r.photos])).toEqual([["T1-Q1", ["/example-photo.jpg"]]]);
  });
  it("never overwrites an existing id", () => {
    const mine = { answers: ["내 글", "", "", ""], updatedAt: 1 };
    expect(withExamples({ "T2-Q1": mine }, now)["T2-Q1"]).toBe(mine);
  });
});
