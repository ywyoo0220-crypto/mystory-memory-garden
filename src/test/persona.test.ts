import { describe, expect, it } from "vitest";
import { personaLinks, resolvePersona } from "@/lib/persona";
const mem = () => { const m = new Map<string, string>(); return { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v) }; };
describe("persona icons", () => {
  it("maps ?p=A to A links", () => expect(personaLinks(resolvePersona("?p=A", mem()))).toEqual({ manifest: "/manifest-A.webmanifest", apple: "/apple-touch-icon-A.png" }));
  it("falls back to defaults for missing or unknown p", () => {
    expect(personaLinks(resolvePersona("", mem())).manifest).toBe("/manifest.webmanifest");
    expect(personaLinks(resolvePersona("?p=D", mem())).apple).toBe("/apple-touch-icon.png");
  });
  it("keeps the first persona after ?p= disappears", () => { const s = mem(); resolvePersona("?p=C", s); expect(resolvePersona("", s)).toBe("C"); });
});
