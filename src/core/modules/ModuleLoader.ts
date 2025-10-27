import {
  ContentState,
  RawOattsManifest,
  RawCourse,
  Course,
  CourseContent,
  CourseContentItemType,
  RawCourseContent,
  OattsManifest,
} from "@/core/model/OattsModel";
import User from "@/core/model/UserModel";
import { loadModel } from "../scorm/ScormHelper";
import { internalizeCompletionStatus } from "../scorm/ScormInternalizer";
import { GetInternalContentState } from "../database/Content";
import { UserContextType } from "../../contexts/UserContext";
import CoursesContext from "./ContentContext";
import { ScormModel } from "../model/ScormModel";



export async function GetCoursesWithState(user: User, config: OattsManifest): Promise<Course[]> {
  let courses = config.courses;
  let statefulCourses: Course[] = []
  for (let course of courses) {
    let statefulCourse = await StatefulifyRawCourse(course, user);
    statefulCourses.push(statefulCourse);
  }
  return statefulCourses;
}


// Adds state to a raw course, returning a course.
export async function StatefulifyRawCourse(course: RawCourse, user: User): Promise<Course> {
  let statefulContents: CourseContent[] = []
  for (const content of course.contents) {
    let statefulContent = await StatefulifyRawContent(content, user);
    statefulContents.push(statefulContent);
  }

  return {
    id: course.id,
    name: course.name,
    roleIds: course.roleIds,
    description: course.description,
    img: course.img,
    paNumber: course.paNumber,
    timeToComplete: course.timeToComplete,
    contents: statefulContents,
  }
}

async function StatefulifyRawContent(content: RawCourseContent, user: User): Promise<CourseContent> {
  // Populate any children.
  let statefulChildren: CourseContent[] | undefined = undefined
  if (content.type === CourseContentItemType.SUBMODULE && content.children != null) {
    for (let child of content.children) {
      let statefulChild = await StatefulifyRawContent(child, user);
      if (statefulChildren == undefined) {
        statefulChildren = [statefulChild];
      }
      else {
        statefulChildren.push(statefulChild);
      }
    }
  }


  let internalState = await GetInternalContentState(user, content.id);

  let scormState: ScormModel | undefined = undefined

  if (content.type === CourseContentItemType.SCORM) {
    const stateModel = await loadModel(user, content.id);
    scormState = stateModel;
    if (internalState != undefined) {
      internalState!.completionStatus = internalizeCompletionStatus(stateModel.cmi.completion_status);
    }
  }

  return {
    id: content.id,
    name: content.name,
    type: content.type,
    description: content.description,
    entrypoint: content.entrypoint,
    children: statefulChildren,
    state: internalState ?? new ContentState(),
    scormState: scormState
  }

}


export async function loadRequiredAndOptionalCourses({ context }: { context: { authentication: UserContextType; courses: CoursesContext; config: RawOattsManifest } }) {
  const user = context.authentication.user;
  if (user === undefined) {
    console.error("No user set while attempting to retrieve modules");
    return { required: [], optional: [] };
  }


  let courses: Course[] = []
  // Un-raw? Cook? Statefulify? The raw course.
  for (let rawCourse of context.config.courses) {
    const statefulCourse = await StatefulifyRawCourse(rawCourse, user);
    courses.push(statefulCourse);
  }

  context.courses.courses = courses;


  let focusedCourses: Course[] = [];
  let supplementaryCourses: Course[] = [];

  // Sort focused and supplementary.
  for (let course of courses) {
    if (user.roles.some(role => course.roleIds.includes(role))) {
      focusedCourses.push(course)
    }
    else {
      supplementaryCourses.push(course)
    }
  }

  return { required: focusedCourses, optional: supplementaryCourses };
}
