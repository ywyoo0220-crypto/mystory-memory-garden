import { describe, expect, it } from "vitest";
import { cn } from "@/lib/utils";

describe("cn", () => {
  it("treats the type tokens as font sizes, so a screen's size wins over the Button default", () => {
    expect(cn("text-sm font-medium", "text-body text-ink-foreground")).toBe("font-medium text-body text-ink-foreground");
    expect(cn("text-sm", "text-caption")).toBe("text-caption");
  });
  it("keeps a text colour next to a type token", () => {
    expect(cn("text-foreground", "text-caption")).toBe("text-foreground text-caption");
  });
});
