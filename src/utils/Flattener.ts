
/*
 * Copyright © 2026 DCS Corporation, 6909 Metro Park Drive Suite 500, Alexandria, VA 22310.
 * See the LICENSE file for rights & permissions.
 */

import { Course, CourseContent } from "@/core/model/OattsModel";

/*
 * Copyright © 2026 DCS Corporation, 6909 Metro Park Drive Suite 500, Alexandria, VA 22310.
 * See the LICENSE file for rights & permissions.
 */
export function FlattenCourse(course: Course) {
    return FlattenContents(course.contents);
}


/** Depth first inorder traversal. */
export function FlattenContents(contents: CourseContent[]): CourseContent[] {
    const result: CourseContent[] = [];

    function traverse(items: CourseContent[]) {
        for (const item of items) {
            result.push(item);
            if (item.children) {
                traverse(item.children);
            }
        }
    }

    traverse(contents);
    return result;
}