import { Course, CourseContent } from "@/core/model/OattsModel";

/*
 * Copyright © 2026 DCS Corporation, 6909 Metro Park Drive Suite 500, Alexandria, VA 22310.
 * See the LICENSE file for rights & permissions.
 */
export function FlattenCourse(course: Course) {
    return FlattenContents(course.contents);
}


/** Depth first traversal. */
export function FlattenContents(contents: CourseContent[]): CourseContent[] {
    const result: CourseContent[] = [];
    const stack = [...contents];

    while (stack.length > 0) {
        const item = stack.pop()!;
        result.push(item);
        if (item.children) {
            stack.push(...item.children);
        }
    }

    return result;
}