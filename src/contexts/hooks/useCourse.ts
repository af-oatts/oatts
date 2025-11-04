import { useRouteContext } from "@tanstack/react-router";

export function useCourse(id: string) {
  const context = useRouteContext({ from: "/_authenticated/_authorized" });

  if (!id) return undefined;
  const course = context.config.courses?.find((course) => course.id === id);

  return course;
}
