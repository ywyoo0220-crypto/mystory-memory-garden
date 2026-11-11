import { describe, expect, it } from "vitest";
import { audioKey, fmtDur, MAX_REC_SEC, parseDur } from "@/lib/audio";

describe("voice recording rules", () => {
  it("auto-stops at 2:00", () => expect(MAX_REC_SEC).toBe(120));
  it("keeps one recording per answer, keyed recordId:step", () => expect(audioKey("T1-Q1", 2)).toBe("T1-Q1:2"));
  it("stores duration as m:ss", () => {
    expect(fmtDur(23)).toBe("0:23");
    expect(parseDur("1:05")).toBe(65);
  });
});
