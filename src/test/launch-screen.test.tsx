import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LAUNCH_LABEL, LAUNCH_MS, LAUNCH_REDUCED_MS, LAUNCH_SESSION_KEY, LaunchScreen } from "@/components/LaunchScreen";

describe("launch session", () => {
  beforeEach(() => { sessionStorage.clear(); vi.useFakeTimers(); });
  afterEach(() => { cleanup(); vi.useRealTimers(); vi.restoreAllMocks(); });
  it("shows on the first load and finishes after LAUNCH_MS", () => {
    render(<LaunchScreen />);
    expect(screen.getByRole("img", { name: LAUNCH_LABEL })).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(LAUNCH_MS - 1));
    expect(screen.queryByRole("img", { name: LAUNCH_LABEL })).not.toBeNull();
    act(() => vi.advanceTimersByTime(1));
    expect(screen.queryByRole("img", { name: LAUNCH_LABEL })).toBeNull();
  });
  it("does not show with the session flag already set", () => {
    sessionStorage.setItem(LAUNCH_SESSION_KEY, "1");
    render(<LaunchScreen />);
    expect(screen.queryByRole("img", { name: LAUNCH_LABEL })).toBeNull();
  });
  it("skips on tap and does not return on a remount", () => {
    const view = render(<LaunchScreen />);
    fireEvent.click(screen.getByRole("img", { name: LAUNCH_LABEL }));
    expect(screen.queryByRole("img", { name: LAUNCH_LABEL })).toBeNull();
    view.unmount();
    render(<LaunchScreen />);
    expect(screen.queryByRole("img", { name: LAUNCH_LABEL })).toBeNull();
  });
  it("finishes after LAUNCH_REDUCED_MS with reduced motion", () => {
    vi.spyOn(window, "matchMedia").mockReturnValue({ matches: true } as MediaQueryList);
    render(<LaunchScreen />);
    act(() => vi.advanceTimersByTime(LAUNCH_REDUCED_MS - 1));
    expect(screen.queryByRole("img", { name: LAUNCH_LABEL })).not.toBeNull();
    act(() => vi.advanceTimersByTime(1));
    expect(screen.queryByRole("img", { name: LAUNCH_LABEL })).toBeNull();
  });
});