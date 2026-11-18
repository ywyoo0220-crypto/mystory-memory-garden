import { describe, expect, it, vi } from "vitest";
vi.mock("@/assets/mystory_wordmark.png.asset.json", () => ({ default: { url: "" } }));
import { homeCards, homeGroups } from "@/routes/index";
import type { Records } from "@/lib/store";

const r = (t: number) => ({ answers: ["답", "", "", ""], updatedAt: t });
const records: Records = { "T7-Q1": r(1), "T8-Q1": r(2), "T7-Q2": r(3), "A3-Q1": r(9), "A1-Q2": r(1), "A1-Q1": r(5) };

describe("Home cards", () => {
  it("주제별: one card per record, newest first, topics interleaved", () => {
    expect(homeCards(records, "topic").map((c) => c.qid)).toEqual(["T7-Q2", "T8-Q1", "T7-Q1"]);
  });
  it("시간순: period order then question order, never by date", () => {
    expect(homeCards(records, "period").map((c) => c.qid)).toEqual(["A1-Q1", "A1-Q2", "A3-Q1"]);
  });
  it("같은 카테고리 기록은 카드 한 장에 모인다", () => {
    expect(homeGroups(records, "period").map((g) => [g.cat.id, g.items.map((i) => i.qid)])).toEqual([["A1", ["A1-Q1", "A1-Q2"]], ["A3", ["A3-Q1"]]]);
    expect(homeGroups(records, "topic").map((g) => [g.cat.id, g.items.map((i) => i.qid)])).toEqual([["T7", ["T7-Q2", "T7-Q1"]], ["T8", ["T8-Q1"]]]);
  });
});
