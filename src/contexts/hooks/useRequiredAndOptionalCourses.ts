
/*
 * Copyright © 2026 DCS Corporation, 6909 Metro Park Drive Suite 500, Alexandria, VA 22310.
 * See the LICENSE file for rights & permissions.
 */

import { useUser } from "@/contexts/hooks/useUser";
import { useCoursesContext } from "@/contexts/providers/CourseContextProvider";
import { Course } from "../../core/model/OattsModel";

export function useRequiredAndOptionalCourses() {
  const { user } = useUser();
  const [courses] = useCoursesContext();
  if (user === undefined) {
    console.error("No user set while attempting to retrieve modules");
    return { required: [], optional: [] };
  }

  let focusedCourses: Course[] = [];
  let supplementaryCourses: Course[] = [];

  // Sort focused and supplementary.
  for (let course of courses) {
    if (user.roles.some((role) => course.roleIds.includes(role))) {
      focusedCourses.push(course);
    } else {
      supplementaryCourses.push(course);
    }
  }

  return { required: focusedCourses, optional: supplementaryCourses };
}
