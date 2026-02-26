import { Course, CourseContent } from "@/core/model/OattsModel";

/*
 * Copyright © 2026 DCS Corporation, 6909 Metro Park Drive Suite 500, Alexandria, VA 22310.
 * See the LICENSE file for rights & permissions.
 */
export function FlattenCourse(course: Course) {
    return FlattenContents(course.contents);
}

export function FlattenContents(contents: CourseContent[]) {
    let arr : CourseContent[] = [ ]
    for( let content of contents) {
        if(!content.children) {
            continue;
        }
        arr = [...arr, ...FlattenContents(content.children)]
    }
    return arr;
}