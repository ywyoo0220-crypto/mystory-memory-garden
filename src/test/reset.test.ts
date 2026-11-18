import { describe, expect, it } from "vitest";
import { resetApp } from "@/lib/reset";

describe("resetApp", () => {
  it("removes every app key and the session, and keeps other sites' keys", async () => {
    localStorage.setItem("mystory.records.v1", "{}");
    localStorage.setItem("mystory.profile.v1", '{"name":"관람객","birth":"1950"}');
    localStorage.setItem("mystory.pin.v1", "hash");
    localStorage.setItem("ms.onb", "1");
    localStorage.setItem("other.key", "keep");
    sessionStorage.setItem("mystory.launch.seen.v1", "1");
    await resetApp();
    expect(
      Object.keys(localStorage).filter((k) => k.startsWith("mystory.") || k.startsWith("ms.")),
    ).toEqual([]);
    expect(localStorage.getItem("other.key")).toBe("keep");
    expect(sessionStorage.length).toBe(0);
  });
});
