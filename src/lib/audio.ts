import { useEffect, useState } from "react";

/** Voice blobs live in IndexedDB "ms-audio" / store "a", keyed `${recordId}:${stepIndex}` — never localStorage. */
const DB = "ms-audio";
const STORE = "a";
export const MAX_REC_SEC = 120;
export const audioKey = (recordId: string, step: number) => `${recordId}:${step}`;
export function fmtDur(sec: number) {
  const s = Math.max(0, Math.round(sec));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}
export function parseDur(d: string) {
  const [m = "0", s = "0"] = d.split(":");
  return Number(m) * 60 + Number(s) || 0;
}

let dbp: Promise<IDBDatabase> | null = null;
function db() {
  if (!dbp)
    dbp = new Promise((res, rej) => {
      const r = indexedDB.open(DB, 1);
      r.onupgradeneeded = () => r.result.createObjectStore(STORE);
      r.onsuccess = () => res(r.result);
      r.onerror = () => rej(r.error);
    });
  return dbp;
}
function tx<T>(mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest): Promise<T> {
  return db().then(
    (d) =>
      new Promise<T>((res, rej) => {
        const q = fn(d.transaction(STORE, mode).objectStore(STORE));
        q.onsuccess = () => res(q.result as T);
        q.onerror = () => rej(q.error);
      }),
  );
}
const listeners = new Set<(key: string) => void>();
const changed = (k: string) => listeners.forEach((l) => l(k));

/** Stored as ArrayBuffer + type: Safari is unreliable with raw Blobs in IndexedDB. */
export async function putAudio(key: string, blob: Blob) {
  const buf = await blob.arrayBuffer();
  await tx("readwrite", (s) => s.put({ type: blob.type, buf }, key));
  changed(key);
}
export async function getAudio(key: string) {
  const v = await tx<{ type: string; buf: ArrayBuffer } | undefined>("readonly", (s) => s.get(key));
  return v ? new Blob([v.buf], { type: v.type }) : undefined;
}
export function deleteAudio(keys: string[]) {
  keys.forEach((k) => tx("readwrite", (s) => s.delete(k)).then(() => changed(k)).catch(() => {}));
}
export function clearAudio(): Promise<void> {
  return tx("readwrite", (s) => s.clear()).then(() => undefined, () => undefined);
}
export async function allAudioKeys() {
  return (await tx<IDBValidKey[]>("readonly", (s) => s.getAllKeys())).map(String);
}

export function useAudioUrl(key?: string) {
  const [url, setUrl] = useState<string>();
  const [ver, setVer] = useState(0);
  useEffect(() => {
    if (!key) return;
    const l = (k: string) => k === key && setVer((v) => v + 1);
    listeners.add(l);
    return () => void listeners.delete(l);
  }, [key]);
  useEffect(() => {
    setUrl(undefined);
    if (!key) return;
    let alive = true;
    let u: string | undefined;
    getAudio(key)
      .then((b) => b && alive && setUrl((u = URL.createObjectURL(b))))
      .catch(() => {});
    return () => {
      alive = false;
      if (u) URL.revokeObjectURL(u);
    };
  }, [key, ver]);
  return url;
}

export const blobToDataUrl = (b: Blob) =>
  new Promise<string>((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(String(r.result));
    r.onerror = () => rej(r.error);
    r.readAsDataURL(b);
  });
export const dataUrlToBlob = (d: string) => fetch(d).then((r) => r.blob());
