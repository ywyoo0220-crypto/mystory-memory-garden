import { describe, expect, it } from "vitest";
import { canSaveOnboardingProfile } from "@/lib/onboarding";

describe("Onboarding profile progression", () => {
  it("does not allow saving without a name, even when a birth year is entered", () => {
    expect(canSaveOnboardingProfile("", "1955")).toBe(false);
    expect(canSaveOnboardingProfile("   ", "1955")).toBe(false);
  });
  it("allows a name without the optional birth year", () => {
    expect(canSaveOnboardingProfile("김정희", "")).toBe(true);
  });
  it("rejects incomplete or invalid birth years before continuing", () => {
    expect(canSaveOnboardingProfile("김정희", "195")).toBe(false);
    expect(canSaveOnboardingProfile("김정희", "1899")).toBe(false);
    expect(canSaveOnboardingProfile("김정희", "1955")).toBe(true);
  });
});