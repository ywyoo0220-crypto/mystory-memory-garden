import { QueryClient } from "@tanstack/react-query";
import { createMemoryHistory, createRouter, rootRouteId } from "@tanstack/react-router";
import { describe, expect, it, vi } from "vitest";

import { routeTree } from "@/routeTree.gen";
import { goBackFromQuestions } from "@/routes/cat.$catId";

// Match routes without running loaders or rendering: loaders may need a server or
// network the test run lacks, and jsdom never loads the stylesheets React waits on.
describe("App routing", () => {
  it("matches a page for / instead of falling back to not found", () => {
    const router = createRouter({ routeTree, context: { queryClient: new QueryClient() } });

    const matches = router.matchRoutes("/");

    expect(matches.at(-1)?.routeId).not.toBe(rootRouteId);
  });
});

describe("Question list back navigation", () => {
  it("returns to Home after leaving the answer screen opened from Home", () => {
    const history = createMemoryHistory({ initialEntries: ["/", "/cat/T7", "/answer/T7-Q1"] });
    history.back();
    expect(history.location.pathname).toBe("/cat/T7");
    goBackFromQuestions(history, () => history.push("/kind/topic"));
    expect(history.location.pathname).toBe("/");
  });

  it("returns to the category picker when entered through recording", () => {
    const history = createMemoryHistory({ initialEntries: ["/record", "/kind/period", "/cat/A3"] });
    goBackFromQuestions(history, () => history.push("/"));
    expect(history.location.pathname).toBe("/kind/period");
  });

  it("uses the fallback for a directly opened question list", () => {
    const history = createMemoryHistory({ initialEntries: ["/cat/A3"] });
    const fallback = vi.fn(() => history.push("/kind/period"));
    goBackFromQuestions(history, fallback);
    expect(fallback).toHaveBeenCalledOnce();
    expect(history.location.pathname).toBe("/kind/period");
  });
});
