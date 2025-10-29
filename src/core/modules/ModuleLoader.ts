import {
  ContentState,
  OattsManifest,
  StatelessCourse,
  Course,
  CourseContent,
  CourseContentItemType,
  StatelessCourseContent,
} from "@/core/model/OattsModel";
import User from "@/core/model/UserModel";
import { loadModel } from "../scorm/ScormHelper";
import { internalizeCompletionStatus } from "../scorm/ScormInternalizer";
import { GetInternalContentState } from "../database/Content";
import { UserContextType } from "../../contexts/UserContext";
import CoursesContext from "./ContentContext";
import { ScormModel } from "../model/ScormModel";

/**
 * Converts an array of stateless courses to stateful courses with user-specific data
 * @param user - The user context for state processing
 * @param courses - Array of stateless courses to convert
 * @returns Promise resolving to array of stateful courses
 */
export async function loadCoursesWithState(user: User, courses: StatelessCourse[]): Promise<Course[]> {
  // Process all courses concurrently for better performance
  const coursePromises = courses.map(loadCourseWithState(user));
  return Promise.all(coursePromises);
}

/**
 * Converts a stateless course to a stateful course with user-specific data
 * @param course - The stateless course to convert
 * @param user - The user context for state processing
 * @returns Promise resolving to a stateful course
 */
export function loadCourseWithState(user: User) {
  return async (course: StatelessCourse): Promise<Course> => {
    // Process all content items concurrently
    const contentPromises = course.contents.map((content) => loadContentWithState(content, user));
    const statefulContents = await Promise.all(contentPromises);

    return {
      id: course.id,
      name: course.name,
      roleIds: course.roleIds,
      description: course.description,
      img: course.img,
      paNumber: course.paNumber,
      timeToComplete: course.timeToComplete,
      contents: statefulContents,
    };
  };
}

/**
 * Converts stateless content to stateful content with user-specific data
 * @param content - The stateless content to convert
 * @param user - The user context for state processing
 * @returns Promise resolving to stateful content
 */
async function loadContentWithState(content: StatelessCourseContent, user: User): Promise<CourseContent> {
  // Process children, internal state, and SCORM state concurrently where possible
  const [statefulChildren, internalState] = await Promise.all([
    processContentChildren(content, user),
    GetInternalContentState(user, content.id),
  ]);

  // Process SCORM state (needs internal state, so must be sequential)
  const scormState = await processScormState(content, user, internalState);

  return {
    id: content.id,
    name: content.name,
    type: content.type,
    description: content.description,
    entrypoint: content.entrypoint,
    children: statefulChildren,
    state: internalState ?? new ContentState(),
    scormState,
  };
}

/**
 * Processes children for submodule content types
 * @param content - The content to process children for
 * @param user - The user context
 * @returns Promise resolving to processed children array or undefined
 */
async function processContentChildren(
  content: StatelessCourseContent,
  user: User,
): Promise<CourseContent[] | undefined> {
  if (content.type !== CourseContentItemType.SUBMODULE || !content.children?.length) {
    return undefined;
  }

  // Process all children concurrently for better performance
  const childPromises = content.children.map((child) => loadContentWithState(child, user));
  return Promise.all(childPromises);
}

/**
 * Processes SCORM-specific state for SCORM content types
 * @param content - The content to process
 * @param user - The user context
 * @param internalState - The internal state to potentially modify
 * @returns Promise resolving to SCORM state or undefined
 */
async function processScormState(
  content: StatelessCourseContent,
  user: User,
  internalState: ContentState | undefined,
): Promise<ScormModel | undefined> {
  if (content.type !== CourseContentItemType.SCORM) {
    return undefined;
  }

  return loadModel(user, content.id)
    .then((stateModel) => {
      // Update internal state completion status if available
      if (internalState && stateModel?.cmi?.completion_status) {
        internalState.completionStatus = internalizeCompletionStatus(stateModel.cmi.completion_status);
      }

      return stateModel;
    })
    .catch((error) => {
      console.error(`Failed to load SCORM model for content ${content.id}:`, error);
      return undefined;
    });
}

/**
 * Loads pre-quizzes for a user based on their roles
 * @param user - The user to load quizzes for
 * @param manifest - The OATTS manifest containing quiz definitions
 * @returns Promise resolving to array of quiz content
 */
export async function loadPreQuizzes(user: User, manifest: OattsManifest): Promise<CourseContent[]> {
  // Filter quizzes relevant to user roles first
  const isUserRolePresent = (quiz: StatelessCourse) => quiz.roleIds.some((roleId) => user.roles.includes(roleId));
  const relevantQuizzes = (manifest.prequizzes || []).filter(isUserRolePresent);

  if (!relevantQuizzes.length) {
    return [];
  }

  // Process all relevant quizzes concurrently
  const quizPromises = relevantQuizzes.map(loadCourseWithState(user));
  return Promise.all(quizPromises)
    .then((courses) => courses.flatMap((course) => course.contents))
    .catch((error) => {
      console.error(error);
      return [];
    });
}

type CategorizedCourses = { required: Course[]; optional: Course[] };
/**
 * Loads and categorizes courses into required and optional based on user roles
 * @param context - Application context containing user, courses, and config
 * @returns Object containing required and optional course arrays
 */
export async function loadRequiredAndOptionalCourses({
  context,
}: {
  context: { authentication: UserContextType; courses: CoursesContext; config: OattsManifest };
}): Promise<CategorizedCourses> {
  const { user } = context.authentication;

  if (!user) {
    console.error("No user set while attempting to retrieve modules");
    return { required: [], optional: [] };
  }
  const coursePromises = context.config.courses.map(loadCourseWithState(user));

  return Promise.all(coursePromises)
    .then((courses) => {
      // Update context with processed courses
      context.courses.courses = courses;
      return categorizeCoursesByUserRoles(courses, user);
    })
    .catch((error) => {
      console.error("Failed to load courses:", error);
      return { required: [], optional: [] };
    });
}

/**
 * Categorizes courses into required and optional based on user roles
 * @param courses - Array of courses to categorize
 * @param user - User to check roles against
 * @returns Object with required and optional course arrays
 */
function categorizeCoursesByUserRoles(courses: Course[], user: User): CategorizedCourses {
  const required: Course[] = [];
  const optional: Course[] = [];
  const categories = { required, optional };

  for (const course of courses) {
    const isUserRoleMatch = user.roles.some((userRole) => course.roleIds.includes(userRole));
    const category = isUserRoleMatch ? "required" : "optional";
    categories[category].push(course);
  }

  return categories;
}
