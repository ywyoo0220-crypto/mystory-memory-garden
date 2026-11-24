import { describe, expect, it } from "vitest";
import { DEVICE_NAME, detectDevice, josa } from "@/lib/device";
import { deckColumns } from "@/routes/index";

const GALAXY = "Mozilla/5.0 (Linux; Android 14; SM-S901N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36";
const IPHONE = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.6 Mobile/15E148 Safari/604.1";
const IPAD_AS_MAC = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.6 Safari/605.1.15";
const GALAXY_TAB = "Mozilla/5.0 (Linux; Android 14; SM-X710) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36";
const WINDOWS = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36";

describe("device wording", () => {
  it("names the device the app is open on", () => {
    expect(detectDevice(GALAXY, true, 5)).toBe("phone");
    expect(detectDevice(IPHONE, true, 5)).toBe("phone");
    // iPadOS Safari says it is a Mac; touch points tell them apart.
    expect(detectDevice(IPAD_AS_MAC, true, 5)).toBe("tablet");
    expect(detectDevice(IPAD_AS_MAC, false, 0)).toBe("computer");
    expect(detectDevice(GALAXY_TAB, true, 5)).toBe("tablet");
    expect(detectDevice(WINDOWS, false, 0)).toBe("computer");
    // A touch laptop is still a computer: its main pointer is the mouse or trackpad.
    expect(detectDevice(WINDOWS, false, 10)).toBe("computer");
  });

  it("picks the particle that fits each device name", () => {
    expect(Object.values(DEVICE_NAME).map((d) => d + josa(d, "과", "와"))).toEqual(["휴대폰과", "태블릿과", "컴퓨터와"]);
    expect(Object.values(DEVICE_NAME).map((d) => d + josa(d, "으로", "로"))).toEqual(["휴대폰으로", "태블릿으로", "컴퓨터로"]);
    expect(josa("연필", "으로", "로")).toBe("로");
  });
});

describe("home deck on a laptop", () => {
  it("deals cards left then right, keeping the reading order row by row", () => {
    expect(deckColumns(["유년기", "10대", "20대", "30대", "40대"], 2)).toEqual([["유년기", "20대", "40대"], ["10대", "30대"]]);
    expect(deckColumns(["가족"], 2)).toEqual([["가족"]]);
    expect(deckColumns(["가족", "건강"], 1)).toEqual([["가족", "건강"]]);
  });
});
