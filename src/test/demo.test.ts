import { describe, expect, it } from "vitest";
import { resolveDemo } from "@/lib/demo";
const mem = () => { const m = new Map<string, string>(); return { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v), removeItem: (k: string) => void m.delete(k) }; };
describe("try-out device mode", () => {
  it("is off by default", () => expect(resolveDemo("", mem())).toBe(false));
  it("stays on after ?demo=1 disappears", () => { const s = mem(); expect(resolveDemo("?demo=1", s)).toBe(true); expect(resolveDemo("", s)).toBe(true); });
  it("turns off with ?demo=0", () => { const s = mem(); resolveDemo("?demo=1", s); expect(resolveDemo("?demo=0", s)).toBe(false); expect(resolveDemo("", s)).toBe(false); });
});
