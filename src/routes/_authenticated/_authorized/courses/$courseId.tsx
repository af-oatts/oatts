
/*
 * Copyright © 2026 DCS Corporation, 6909 Metro Park Drive Suite 500, Alexandria, VA 22310.
 * See the LICENSE file for rights & permissions.
 */

import { ReactNode } from "react";

import { createFileRoute, Outlet } from "@tanstack/react-router";

const FILE_ROUTE = "/_authenticated/_authorized/courses/$courseId";

export const Route = createFileRoute(FILE_ROUTE)({
  component: ModulePage,
});

export default function ModulePage(): Readonly<ReactNode> {
  return <Outlet />;
}
