import { describe, expect, it, vi } from "vitest";
vi.mock("@/assets/mystory_wordmark.png.asset.json", () => ({ default: { url: "" } }));
import { homeCards } from "@/routes/index";
import { exampleSeeds, withExamples } from "@/lib/store";

describe("Example records", () => {
  const now = Date.UTC(2026, 10, 12);
  it("주제별 order", () => {
    expect(homeCards(exampleSeeds(now), "topic").map((c) => c.qid)).toEqual(["T2-Q3", "T1-Q1", "T7-Q2", "T3-Q4", "T8-Q4"]);
  });
  it("시기별 order", () => {
    expect(homeCards(exampleSeeds(now), "period").map((c) => c.qid)).toEqual(["A3-Q1", "A6-Q3", "A7-Q3"]);
  });
  it("t = now - daysAgo days, ex true, bundled voice file", () => {
    const r = exampleSeeds(now)["T1-Q1"]!;
    expect(r.updatedAt).toBe(now - 10 * 86400000);
    expect(r.example).toBe(true);
    expect(exampleSeeds(now)["A7-Q3"]!.voices).toEqual([{ step: 2, dur: "0:14", audio: false, text: expect.any(String), src: "/examples/C_A7-Q3_3.mp3" }]);
  });
  it("keeps each photo on its own answer step", () => {
    const r = exampleSeeds(now)["T8-Q4"]!;
    expect(r.photos).toEqual(["/examples/C_T8-Q4_1.jpg", "/examples/C_T8-Q4_2.jpg", "/examples/C_T8-Q4_4.jpg"]);
    expect(r.photoSteps).toEqual([0, 1, 3]);
  });
  it("leaves two records unfinished for 이어서 쓰기", () => {
    const open = Object.entries(exampleSeeds(now)).filter(([, r]) => r.answers.some((a) => !a.trim())).map(([k]) => k);
    expect(open.sort()).toEqual(["A7-Q3", "T7-Q2"]);
  });
  it("never overwrites an existing id", () => {
    const mine = { answers: ["내 글", "", "", ""], updatedAt: 1 };
    expect(withExamples({ "T2-Q3": mine }, now)["T2-Q3"]).toBe(mine);
  });
});
