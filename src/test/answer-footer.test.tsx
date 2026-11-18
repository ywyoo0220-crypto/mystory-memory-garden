import { QueryClient } from "@tanstack/react-query";
import { RouterProvider, createMemoryHistory, createRouter } from "@tanstack/react-router";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { routeTree } from "@/routeTree.gen";
import { ONB_KEY } from "@/lib/onboarding";
import { LAUNCH_SESSION_KEY } from "@/components/LaunchScreen";

/**
 * The answer screen's footer: the skip button only makes sense while questions remain,
 * so it must disappear on the last step where the main button already finishes the record.
 */
async function renderAnswer(step: number) {
  localStorage.setItem(ONB_KEY, "1");
  sessionStorage.setItem(LAUNCH_SESSION_KEY, "1");
  const router = createRouter({
    routeTree,
    context: { queryClient: new QueryClient() },
    history: createMemoryHistory({ initialEntries: [`/answer/A1-Q2?step=${step}`] }),
  });
  await router.load();
  render(<RouterProvider router={router} />);
}

describe("Answer footer buttons", () => {
  afterEach(cleanup);

  it("offers skipping on the first step", async () => {
    await renderAnswer(0);
    expect(await screen.findByRole("button", { name: "다음" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "다음에 답할게요" })).toBeInTheDocument();
  });

  it("hides the skip button on the last step, leaving only the finish button", async () => {
    await renderAnswer(3);
    expect(await screen.findByRole("button", { name: "기록 마치기" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "다음에 답할게요" })).toBeNull();
  });
});
