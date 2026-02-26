import { useStatuses } from "@/contexts/hooks/useStatus";
import { usePrequizCourses } from "@/contexts/providers/CourseContextProvider";
import { Course, CourseContent } from "@/core/model/OattsModel";
import { FlattenCourse } from "@/utils/Flattener";
import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useMemo } from "react";

export const Route = createFileRoute("/_authenticated/onboarding/preQuiz")({
  component: RouteComponent,
});

function RouteComponent() {

  const [courses] = usePrequizCourses();
  const contents = useMemo(() => courses?.reduce<CourseContent[]>((acc: CourseContent[], course) => [...acc, ...FlattenCourse(course)], []), [courses]);
  const statuses = useMemo(() => contents ? useStatuses(contents.map(c => c.id)) : undefined, [contents]);
  const syntheticCourse: Course = contents && courses? {
    contents: contents,
    id: "PREQUIZ",
    name: "OATTS Prequiz",
    roleIds: [],
    paNumber: [],
  } : undefined


  return (
    <Navigate
      to={"/onboarding/$courseId/prequiz/$contentId"}
      params={{
        courseId: controller.course?.id || "",
        contentId: controller.getNext(),
      }}
    />
  );
}
