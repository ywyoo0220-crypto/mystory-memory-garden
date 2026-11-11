import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/onboarding/")({
  beforeLoad: () => {
    throw redirect({ to: "/onboarding/$n", params: { n: "1" }, replace: true });
  },
});
