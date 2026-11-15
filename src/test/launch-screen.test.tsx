import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LAUNCH_SESSION_KEY, LaunchScreen } from "@/components/LaunchScreen";

describe("launch session", () => {
  beforeEach(() => { sessionStorage.clear(); vi.useFakeTimers(); });
  afterEach(() => { cleanup(); vi.useRealTimers(); vi.restoreAllMocks(); });
  it("shows on the first load and finishes after 1400ms", () => {
    render(<LaunchScreen />);
    expect(screen.getByRole("img", { name: "MyStory" })).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(1399));
    expect(screen.queryByRole("img", { name: "MyStory" })).not.toBeNull();
    act(() => vi.advanceTimersByTime(1));
    expect(screen.queryByRole("img", { name: "MyStory" })).toBeNull();
  });
  it("does not show with the session flag already set", () => {
    sessionStorage.setItem(LAUNCH_SESSION_KEY, "1");
    render(<LaunchScreen />);
    expect(screen.queryByRole("img", { name: "MyStory" })).toBeNull();
  });
  it("skips on tap and does not return on a remount", () => {
    const view = render(<LaunchScreen />);
    fireEvent.click(screen.getByRole("img", { name: "MyStory" }));
    expect(screen.queryByRole("img", { name: "MyStory" })).toBeNull();
    view.unmount();
    render(<LaunchScreen />);
    expect(screen.queryByRole("img", { name: "MyStory" })).toBeNull();
  });
  it("finishes after 600ms with reduced motion", () => {
    vi.spyOn(window, "matchMedia").mockReturnValue({ matches: true } as MediaQueryList);
    render(<LaunchScreen />);
    act(() => vi.advanceTimersByTime(599));
    expect(screen.queryByRole("img", { name: "MyStory" })).not.toBeNull();
    act(() => vi.advanceTimersByTime(1));
    expect(screen.queryByRole("img", { name: "MyStory" })).toBeNull();
  });
});