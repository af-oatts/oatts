import { ReactNode } from "react";
import ModuleNotFound from "@/components/module/ModuleNotFound";
import { createFileRoute, Outlet, useParams } from "@tanstack/react-router";
import { useCourse } from "@/contexts/hooks/useCourse";

const FILE_ROUTE = "/_authenticated/_authorized/courses/$courseId";

export const Route = createFileRoute(FILE_ROUTE)({
  component: ModulePage,
});

export default function ModulePage(): Readonly<ReactNode> {
  const { courseId } = useParams({ from: FILE_ROUTE });
  const course = useCourse(courseId);

  if (course === undefined) {
    return <ModuleNotFound />;
  }

  return <Outlet />;
}
