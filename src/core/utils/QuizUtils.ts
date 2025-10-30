import { Role, StatelessCourse, StatelessCourseContent } from "../model/OattsModel";

export function GetFlattenedRoleSpecificQuizzes(courses: StatelessCourse[], roles: Role[]) {
    const flattenContent = (content: StatelessCourseContent) => {
        let flat = [content];
        if(content.children) {
            content.children.forEach(c => flat.push(...flattenContent(c)));
        }
        return flat;
    }

    let contents: StatelessCourseContent[] = []
    for(let course of courses) {
        if(!roles.some(role => course.roleIds.includes(role.id))) {
            continue;
        }
        course.contents.forEach(content => contents.push(...flattenContent(content)))
    }
    return contents;
}