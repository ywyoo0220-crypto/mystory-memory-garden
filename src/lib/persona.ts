// Exhibition personas: ?p=A|B|C swaps the home-screen icon links; kept per session.
export type Persona = "A" | "B" | "C";
const KEY = "mystory.persona.v1";
export const isPersona = (v: unknown): v is Persona => v === "A" || v === "B" || v === "C";
export function personaLinks(p: Persona | null) {
  return p
    ? { manifest: `/manifest-${p}.webmanifest`, apple: `/apple-touch-icon-${p}.png` }
    : { manifest: "/manifest.webmanifest", apple: "/apple-touch-icon.png" };
}
export function resolvePersona(search: string, store: Pick<Storage, "getItem" | "setItem">): Persona | null {
  const q = new URLSearchParams(search).get("p");
  if (isPersona(q)) { try { store.setItem(KEY, q); } catch { /* noop */ } return q; }
  let s: string | null = null;
  try { s = store.getItem(KEY); } catch { /* noop */ }
  return isPersona(s) ? s : null;
}
export function applyPersonaLinks(doc: Document, p: Persona | null) {
  const l = personaLinks(p);
  doc.querySelectorAll<HTMLLinkElement>('link[rel="manifest"]').forEach((e) => e.setAttribute("href", l.manifest));
  doc.querySelectorAll<HTMLLinkElement>('link[rel="apple-touch-icon"]').forEach((e) => e.setAttribute("href", l.apple));
}
