import { describe, expect, it } from "vitest";
import { bookParts, bookPhotos, chosenCover, containsExamples } from "@/lib/book";
import { exampleSeeds, type Records } from "@/lib/store";
import { prefs, getPrefs } from "@/lib/prefs";

describe("Book inclusion and cover rules", () => {
  const examples = exampleSeeds(1000000000);
  it("always places topic records before period records", () => {
    const parts = bookParts(examples);
    expect(parts.map((p) => p.kind)).toEqual(["topic", "period"]);
    expect(parts.map((p) => p.count)).toEqual([5, 3]);
  });
  it("includes only the selected part", () => {
    expect(bookParts(examples, "topic").map((p) => p.count)).toEqual([5]);
    expect(bookParts(examples, "period").map((p) => p.count)).toEqual([3]);
  });
  it("skips empty chapters and creates one part for topic-only records", () => {
    const record = examples["T1-Q1"];
    if (!record) throw new Error("Missing example");
    const parts = bookParts({ "T1-Q1": record });
    expect(parts).toHaveLength(1);
    expect(parts[0]?.chapters.map((c) => c.category.id)).toEqual(["T1"]);
  });
  it("defaults to the example cover only when included records contain examples", () => {
    const profile = { name: "", birth: "" };
    expect(chosenCover(profile, [], containsExamples(examples, bookParts(examples)))).toEqual({ key: "ex", src: "/ex_cover.jpg" });
    expect(chosenCover(profile, [], false).key).toBe("");
  });
  it("respects an explicit no-photo choice even with examples", () => {
    expect(chosenCover({ name: "", birth: "", cover: "" }, [], true).src).toBeUndefined();
  });
  it("falls back without a photo when a chosen record is excluded", () => {
    const photos = bookPhotos(examples, bookParts(examples, "period"));
    expect(chosenCover({ name: "", birth: "", cover: "T1-Q1:0" }, photos, true).key).toBe("");
  });
  it("retains all photo steps in book order, with unique keys for multiple photos", () => {
    const records: Records = { "T1-Q1": { answers: ["이야기"], photos: ["a", "b", "c"], photoSteps: [0, 1, 1], updatedAt: 1 } };
    expect(bookPhotos(records, bookParts(records)).map((p) => [p.key, p.step])).toEqual([["T1-Q1:0", 0], ["T1-Q1:1", 1], ["T1-Q1:1:1", 1]]);
  });
  it("persists the uploaded cover and allows switching away and back", () => {
    prefs.setProfile({ name: "이영숙", birth: "1958", cover: "up", coverUp: "data:image/jpeg;base64,test" });
    const backupProfile = JSON.parse(JSON.stringify(getPrefs().profile));
    expect(backupProfile.coverUp).toBe("data:image/jpeg;base64,test");
    expect(chosenCover(backupProfile, [], false).key).toBe("up");
    expect(chosenCover({ ...backupProfile, cover: "" }, [], false).src).toBeUndefined();
  });
});