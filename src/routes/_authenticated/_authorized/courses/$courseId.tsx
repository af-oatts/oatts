import { ReactNode } from "react";

import { createFileRoute, Outlet } from "@tanstack/react-router";

const FILE_ROUTE = "/_authenticated/_authorized/courses/$courseId";

export const Route = createFileRoute(FILE_ROUTE)({
  component: ModulePage,
});

export default function ModulePage(): Readonly<ReactNode> {
  return <Outlet />;
}
