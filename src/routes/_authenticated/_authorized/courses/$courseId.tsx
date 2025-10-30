import { ReactNode } from "react";
import ModuleNotFound from "@/components/module/ModuleNotFound";
import CourseViewer from "@/components/module/CourseViewer";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/_authorized/courses/$courseId")({
  component: ModulePage,
  loader: async ({ params, context }) => {
    if (params.courseId === undefined) return undefined;

    const course = context.courses.courses?.find((mod) => mod.id == params.courseId);
    const user = context.authentication.user;
    if (course === undefined || user === undefined) return undefined;

    return course;
  },
});

export default function ModulePage(): Readonly<ReactNode> {
  const course = Route.useLoaderData();

  if (course === undefined) {
    return <ModuleNotFound />;
  }
  return <CourseViewer contents={course.contents} paNumber={course.paNumber} />;
}
