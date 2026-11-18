import { useEffect, useState } from "react";

/** Photos and voice recordings live in this device's IndexedDB; records keep "idb:<id>" refs. */
const DB = "mystory-media";
const STORE = "blobs";
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

export const isMediaRef = (ref: string) => ref.startsWith("idb:");

/** Stored as ArrayBuffer + type: Safari has been unreliable with raw Blobs in IndexedDB. */
export async function putMedia(blob: Blob) {
  const id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  const buf = await blob.arrayBuffer();
  await tx("readwrite", (s) => s.put({ type: blob.type, buf }, id));
  return `idb:${id}`;
}

/** Restores a blob under a known ref (backup restore). */
export async function putMediaAt(ref: string, blob: Blob) {
  const buf = await blob.arrayBuffer();
  await tx("readwrite", (s) => s.put({ type: blob.type, buf }, ref.slice(4)));
}

export async function getMedia(ref: string) {
  const v = await tx<{ type: string; buf: ArrayBuffer } | undefined>("readonly", (s) => s.get(ref.slice(4)));
  return v ? new Blob([v.buf], { type: v.type }) : undefined;
}

export function deleteMedia(refs: string[]) {
  refs.filter(isMediaRef).forEach((r) => tx("readwrite", (s) => s.delete(r.slice(4))).catch(() => {}));
}

export function clearMedia(): Promise<void> {
  return tx("readwrite", (s) => s.clear()).then(() => undefined, () => undefined);
}

/** Resolves a photo/audio ref (idb ref or plain URL) to a displayable URL. */
export function useMediaUrl(ref?: string) {
  const [url, setUrl] = useState<string | undefined>(ref && !isMediaRef(ref) ? ref : undefined);
  useEffect(() => {
    if (!ref || !isMediaRef(ref)) {
      setUrl(ref);
      return;
    }
    let alive = true;
    let u: string | undefined;
    getMedia(ref)
      .then((b) => {
        if (b && alive) setUrl((u = URL.createObjectURL(b)));
      })
      .catch(() => {});
    return () => {
      alive = false;
      if (u) URL.revokeObjectURL(u);
    };
  }, [ref]);
  return url;
}
