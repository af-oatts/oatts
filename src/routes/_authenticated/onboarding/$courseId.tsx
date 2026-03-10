
/*
 * Copyright © 2026 DCS Corporation, 6909 Metro Park Drive Suite 500, Alexandria, VA 22310.
 * See the LICENSE file for rights & permissions.
 */

import { createFileRoute, Outlet } from "@tanstack/react-router";


// TODO: Can we delete this?
export const Route = createFileRoute("/_authenticated/onboarding/$courseId")({
  component: RouteComponent,
});

function RouteComponent() {
  return <Outlet />;
}
