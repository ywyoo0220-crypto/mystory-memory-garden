import { describe, expect, it, beforeEach } from "vitest";
import { shareColor } from "@/lib/share";

describe("share cover colour", () => {
  beforeEach(() => { try { sessionStorage.clear(); } catch { /* noop */ } });
  it("keeps a persona's own colour whatever is shared", () => {
    expect(shareColor(["A1-Q1", "A1-Q2"], "이영숙").bg).toBe("#AEB8A0");
    expect(shareColor(["T1-Q1"], "김정희").bg).toBe("#F4676D");
    expect(shareColor(["T1-Q1"], "박정수").bg).toBe("#E4D1BE");
  });
  it("uses the category shared most for anyone else", () => {
    expect(shareColor(["T1-Q1", "T1-Q2", "A1-Q1"], "홍길동").bg).toBe("var(--T1-bg)");
  });
});
