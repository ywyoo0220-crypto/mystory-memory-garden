import { cardColors, categoryOfQuestion } from "@/lib/data";
import type { Records } from "@/lib/store";
import { resolvePersona, type Persona } from "@/lib/persona";

/** Exhibition personas: their representative colour is their app-icon background (also their book cover). */
const PERSONA_COLOR: Record<Persona, { bg: string; fg: string }> = {
  A: { bg: "#F4676D", fg: "#000000" },
  B: { bg: "#E4D1BE", fg: "#000000" },
  C: { bg: "#AEB8A0", fg: "#000000" },
};

/** Each persona's book-cover artwork, used as the default cover of its shared page (A and B: not made yet). */
const PERSONA_COVER: Partial<Record<Persona, string>> = { C: "/cover-C.jpg" };
export const personaCover = (name: string) => { const p = currentPersona(name); return p ? PERSONA_COVER[p] : undefined; };

/** The default cover of a share: the persona's book cover, else the example cover for example records, else none. */
export function defaultCover(qids: string[], records: Records, name: string) {
  return personaCover(name) ?? (qids.some((q) => records[q]?.example) ? "/ex_cover.jpg" : "");
}

/** The three exhibition personas by the name in their profile (A 김정희, B 박정수, C 이영숙). */
const PERSONA_BY_NAME: Record<string, Persona> = { 김정희: "A", 박정수: "B", 이영숙: "C" };

/** Which persona this phone is: the ?p= link if it was opened with one, else the profile name. */
export function currentPersona(name: string): Persona | null {
  let p: Persona | null = null;
  try { p = resolvePersona(window.location.search, sessionStorage); } catch { /* noop */ }
  return p ?? PERSONA_BY_NAME[name.trim()] ?? null;
}

/**
 * The cover colour of a shared page. A persona always gets its own colour (its app-icon and book-cover colour),
 * whatever records are shared; anyone else gets the colour of the category shared most.
 */
export function shareColor(qids: string[], name = ""): { bg: string; fg: string } {
  const p = currentPersona(name);
  if (p) return PERSONA_COLOR[p];
  const n = new Map<string, number>();
  qids.forEach((q) => { const c = categoryOfQuestion(q); if (c) n.set(c.id, (n.get(c.id) ?? 0) + 1); });
  const top = [...n.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
  const cat = top ? categoryOfQuestion(qids.find((q) => categoryOfQuestion(q)?.id === top) ?? "") : undefined;
  if (!cat) return { bg: "#E8E6E1", fg: "#000000" };
  const c = cardColors(cat);
  return { bg: c.bg, fg: c.fg };
}

/** "2026. 10. 12." */
export const fullDate = (t: number) => { const d = new Date(t); return `${d.getFullYear()}. ${d.getMonth() + 1}. ${d.getDate()}.`; };

/** Shared records in the order they were picked, only those that still have content. */
export const sharedRecords = (qids: string[], records: Records) => qids.filter((q) => records[q]);

/** The demo link shown to the user. In this prototype it opens only on the phone that made it. */
export const shareUrl = (id: string) => `${typeof window === "undefined" ? "" : window.location.origin}/s/${id}`;
