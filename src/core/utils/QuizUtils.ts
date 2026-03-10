
/*
 * Copyright © 2026 DCS Corporation, 6909 Metro Park Drive Suite 500, Alexandria, VA 22310.
 * See the LICENSE file for rights & permissions.
 */

import { Course, CourseContent, Role } from "../model/OattsModel";

export function getFlattenedRoleSpecificQuizzes(courses: Course[], roles: Role[]) {
  const flattenContent = (content: CourseContent) => {
    let flat = [content];
    if (content.children) {
      content.children.forEach((c) => flat.push(...flattenContent(c)));
    }
    return flat;
  };

  let contents: CourseContent[] = [];
  for (let course of courses) {
    if (!roles.some((role) => course.roleIds.includes(role.id))) {
      continue;
    }
    course.contents.forEach((content) => contents.push(...flattenContent(content)));
  }
  return contents;
}
