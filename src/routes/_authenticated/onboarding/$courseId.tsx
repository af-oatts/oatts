import { createFileRoute, Outlet } from "@tanstack/react-router";


// TODO: Can we delete this?
export const Route = createFileRoute("/_authenticated/onboarding/$courseId")({
  component: RouteComponent,
});

function RouteComponent() {
  return <Outlet />;
}
