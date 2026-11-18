import { describe, expect, it } from "vitest";
import { canSaveOnboardingProfile, nextOnboardingStep, onboardingStep, previousOnboardingStep } from "@/lib/onboarding";

describe("Onboarding entry flows", () => {
  it("takes first visitors from three guide screens directly to the first-question invitation", () => {
    expect(nextOnboardingStep(1, "first")).toBe(2);
    expect(nextOnboardingStep(2, "first")).toBe(3);
    expect(nextOnboardingStep(3, "first")).toBe(5);
    expect(nextOnboardingStep(5, "first")).toBeUndefined();
  });
  it("ends help replay after three screens without profile setup or recording", () => {
    expect(nextOnboardingStep(1, "help")).toBe(2);
    expect(nextOnboardingStep(2, "help")).toBe(3);
    expect(nextOnboardingStep(3, "help")).toBeUndefined();
    expect(onboardingStep(4, "help")).toBe(3);
    expect(onboardingStep(5, "help")).toBe(3);
  });
  it("returns from the first-question invitation to guide screen three and preserves old URLs", () => {
    expect(previousOnboardingStep(5, "first")).toBe(3);
    expect(previousOnboardingStep(1, "first")).toBeUndefined();
    expect(onboardingStep(4, "first")).toBe(5);
  });
});

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