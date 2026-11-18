import { QueryClient } from "@tanstack/react-query";
import { RouterProvider, createMemoryHistory, createRouter } from "@tanstack/react-router";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { routeTree } from "@/routeTree.gen";
import { getPrefs, prefs } from "@/lib/prefs";
import { ONB_KEY } from "@/lib/onboarding";
import { LAUNCH_SESSION_KEY } from "@/components/LaunchScreen";

describe("Profile editing", () => {
  afterEach(cleanup);

  it("opens the profile and saves edits without depending on the records store", async () => {
    localStorage.setItem(ONB_KEY, "1");
    sessionStorage.setItem(LAUNCH_SESSION_KEY, "1");
    getPrefs();
    prefs.setProfile({ name: "기존 이름", birth: "1958", birthplace: "전남 순천" });
    const router = createRouter({
      routeTree,
      context: { queryClient: new QueryClient() },
      history: createMemoryHistory({ initialEntries: ["/my/profile"] }),
    });
    await router.load();
    render(<RouterProvider router={router} />);

    const name = await screen.findByRole("textbox", { name: "이름" });
    await waitFor(() => expect(name).toHaveValue("기존 이름"));
    fireEvent.change(name, { target: { value: "수정 이름" } });
    fireEvent.click(screen.getByRole("button", { name: "저장하기" }));

    await waitFor(() => expect(router.state.location.pathname).toBe("/my"));
    expect(getPrefs().profile).toMatchObject({ name: "수정 이름", birth: "1958", birthplace: "전남 순천" });
    expect(JSON.parse(localStorage.getItem("mystory.profile.v1") ?? "{}").name).toBe("수정 이름");
    expect(screen.queryByRole("dialog", { name: "프로필 사진" })).toBeNull();
  });

  it("removes the photo through the avatar action sheet and saves without it", async () => {
    localStorage.setItem(ONB_KEY, "1");
    sessionStorage.setItem(LAUNCH_SESSION_KEY, "1");
    getPrefs();
    prefs.setProfile({ name: "이영숙", birth: "1958", photo: "data:image/jpeg;base64,AAA" });
    const router = createRouter({
      routeTree,
      context: { queryClient: new QueryClient() },
      history: createMemoryHistory({ initialEntries: ["/my/profile"] }),
    });
    await router.load();
    render(<RouterProvider router={router} />);

    fireEvent.click(await screen.findByRole("button", { name: "프로필 사진 바꾸기 또는 지우기" }));
    fireEvent.click(await screen.findByRole("button", { name: "현재 사진 지우기" }));
    fireEvent.click(screen.getByRole("button", { name: "저장하기" }));

    await waitFor(() => expect(router.state.location.pathname).toBe("/my"));
    expect(getPrefs().profile.photo).toBeUndefined();
  });
});