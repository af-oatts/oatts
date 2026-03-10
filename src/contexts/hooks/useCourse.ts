
/*
 * Copyright © 2026 DCS Corporation, 6909 Metro Park Drive Suite 500, Alexandria, VA 22310.
 * See the LICENSE file for rights & permissions.
 */

import { useRouteContext } from "@tanstack/react-router";

export function useCourse(id: string) {
  const context = useRouteContext({ from: "/_authenticated/_authorized" });

  if (!id) return undefined;
  const course = context.config.courses?.find((course) => course.id === id);

  return course;
}
