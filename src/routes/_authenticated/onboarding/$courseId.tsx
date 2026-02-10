import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/onboarding/$courseId")({
  component: RouteComponent,
});

function RouteComponent() {
  return <Outlet />;
}
