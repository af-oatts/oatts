import { CompletionStatus, CourseContent, Course } from "@/core/model/OattsModel";
import { OATTS_ROOT } from "../utils/Globals";

/**
 * Calculates the completion status of a course based on its contents.
 * @param course - The course to calculate completion status for
 * @returns The overall completion status of the course
 * @throws Error if course is null/undefined or has no contents
 */
export function calculateCourseCompletionStatus(course: Course): CompletionStatus {
  if (!course) {
    throw new Error("Course cannot be null or undefined");
  }

  if (!course.contents || course.contents.length === 0) {
    return CompletionStatus.NotStarted;
  }

  return calculateMultiContentCompletionStatus(course.contents);
}

/**
 * Calculates the completion status for multiple course contents.
 * @param contents - Array of course contents to evaluate
 * @returns The aggregated completion status
 */
export function calculateMultiContentCompletionStatus(contents: CourseContent[]): CompletionStatus {
  if (!contents || contents.length === 0) {
    return CompletionStatus.NotStarted;
  }

  const statuses = contents.map(calculateContentCompletionStatus);
  return reduceCompletionStatus(statuses);
}

/**
 * Checks if all required courses are completed.
 * @param courses - Array of courses to check
 * @returns True if all courses are completed, false otherwise
 */
export function checkIfRequirementsAreComplete(courses: Course[]): boolean {
  if (!courses || courses.length === 0) {
    return true; // No requirements means requirements are complete
  }

  return courses.every((course) => {
    try {
      return calculateCourseCompletionStatus(course) === CompletionStatus.Completed;
    } catch (error) {
      console.warn(`Error calculating completion status for course ${course?.id}:`, error);
      return false; // Treat errors as incomplete
    }
  });
}

/**
 * Calculates the completion status of a single course content item.
 * Uses memoization for performance optimization on large content trees.
 * @param content - The course content to evaluate
 * @returns The completion status of the content
 */
export function calculateContentCompletionStatus(content: CourseContent): CompletionStatus {
  if (!content) {
    return CompletionStatus.Unknown;
  }

  // If content has children, recursively calculate their status
  if (Array.isArray(content.children) && content.children.length > 0) {
    const completionStatuses = content.children.map(calculateContentCompletionStatus);
    return reduceCompletionStatus(completionStatuses);
  }

  // For leaf nodes, return the content's own completion status
  return content.state?.completionStatus ?? CompletionStatus.Unknown;
}

/**
 * Reduces an array of completion statuses to a single status using aggregation rules.
 * Rules:
 * - If all are Completed -> Completed
 * - If any are Started or Completed -> Started
 * - If all are NotStarted -> NotStarted
 * - If any are Unknown -> Unknown (unless overridden by higher priority statuses)
 * @param statuses - Array of completion statuses to reduce
 * @returns The aggregated completion status
 */
export function reduceCompletionStatus(statuses: CompletionStatus[]): CompletionStatus {
  if (!statuses || statuses.length === 0) {
    return CompletionStatus.NotStarted;
  }

  // Filter out Unknown statuses for cleaner logic
  const knownStatuses = statuses.filter((status) => status !== CompletionStatus.Unknown);

  // If all statuses were Unknown, return Unknown
  if (knownStatuses.length === 0) {
    return CompletionStatus.Unknown;
  }

  // If all known statuses are Completed, return Completed
  if (knownStatuses.every((status) => status === CompletionStatus.Completed)) {
    return CompletionStatus.Completed;
  }

  // If any known status is Started or Completed, return Started
  if (knownStatuses.some((status) => status === CompletionStatus.Started || status === CompletionStatus.Completed)) {
    return CompletionStatus.Started;
  }

  // Otherwise, return NotStarted
  return CompletionStatus.NotStarted;
}

/**
 * Converts a completion status enum to a human-readable string.
 * @param status - The completion status to convert
 * @returns A user-friendly string representation
 */
export function completionStatusToString(status: CompletionStatus): string {
  switch (status) {
    case CompletionStatus.Unknown:
      return "Unknown";
    case CompletionStatus.Completed:
      return "Completed";
    case CompletionStatus.NotStarted:
      return "Not Started";
    case CompletionStatus.Started:
      return "In Progress";
    default:
      console.warn(`Unknown completion status: ${status}`);
      return "Unknown";
  }
}

/**
 * Calculates the overall progress percentage for multiple courses.
 * @param courses - Array of courses to calculate progress for
 * @returns Progress as a decimal between 0 and 1, or 0 if no courses provided
 */
export function calculateCoursesProgress(courses: Course[]): number {
  if (!courses || courses.length === 0) {
    return 0;
  }

  try {
    const progressValues = courses.map(calculateCourseProgress);
    const totalProgress = progressValues.reduce((sum, progress) => sum + progress, 0);
    return totalProgress / courses.length;
  } catch (error) {
    console.error("Error calculating courses progress:", error);
    return 0;
  }
}

/**
 * Calculates the progress percentage for a single course.
 * Progress is calculated as: (completed + inProgress * 0.5) / total
 * @param course - The course to calculate progress for
 * @returns Progress as a decimal between 0 and 1
 */
function calculateCourseProgress(course: Course): number {
  if (!course?.contents || course.contents.length === 0) {
    return 0;
  }

  try {
    const statuses = course.contents.flatMap(flattenContentStatuses);
    const total = statuses.length;

    if (total === 0) {
      return 0;
    }

    const completed = statuses.filter((status) => status === CompletionStatus.Completed).length;
    const inProgress = statuses.filter((status) => status === CompletionStatus.Started).length;

    return (completed + inProgress * 0.5) / total;
  } catch (error) {
    console.error(`Error calculating progress for course ${course.id}:`, error);
    return 0;
  }
}

/**
 * Flattens a course content tree and extracts all completion statuses.
 * @param content - The course content to flatten
 * @returns Array of completion statuses from all leaf nodes
 */
function flattenContentStatuses(content: CourseContent): CompletionStatus[] {
  if (!content) {
    return [];
  }

  const flattenedContents = flattenContentItem(content);
  return flattenedContents.map((item) => item.state?.completionStatus ?? CompletionStatus.Unknown);
}

/**
 * Flattens an array of course contents into a single array of leaf content items.
 * @param contents - Array of course contents to flatten
 * @returns Flattened array of all leaf content items
 */
export function flattenContents(contents: CourseContent[]): CourseContent[] {
  if (!contents || contents.length === 0) {
    return [];
  }

  return contents.flatMap(flattenContentItem);
}

/**
 * Recursively flattens a single course content item and its children.
 * @param content - The course content item to flatten
 * @returns Array of leaf content items (items without children)
 */
function flattenContentItem(content: CourseContent): CourseContent[] {
  if (!content) {
    return [];
  }

  // If content has children, recursively flatten them
  if (Array.isArray(content.children) && content.children.length > 0) {
    return content.children.flatMap(flattenContentItem);
  }

  // This is a leaf node, return it
  return [content];
}

/**
 * Generates the URL for accessing course content.
 * @param content - The course content to generate URL for
 * @returns The complete URL to access the content
 * @throws Error if content is invalid or missing required fields
 */
export function getContentURL(content: CourseContent): string {
  if (!content) {
    throw new Error("Content cannot be null or undefined");
  }

  if (!content.id) {
    throw new Error("Content must have an ID");
  }

  if (!content.entrypoint) {
    throw new Error("Content must have an entrypoint");
  }

  return `${OATTS_ROOT}/content/${content.id}/${content.entrypoint}`;
}

/**
 * Generates the URL for accessing a course's image.
 * @param course - The course to generate image URL for
 * @returns The complete URL to access the course image, or null if no image is specified
 */
export function getCourseImageURL(course: Course): string | null {
  if (!course?.img) {
    return null;
  }

  return `${OATTS_ROOT}/assets/${course.img}`;
}

/**
 * Validates that a course content tree is well-formed.
 * @param content - The course content to validate
 * @returns Object containing validation result and any error messages
 */
export function validateCourseContent(content: CourseContent): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!content) {
    errors.push("Content cannot be null or undefined");
    return { isValid: false, errors };
  }

  if (!content.id) {
    errors.push("Content must have an ID");
  }

  if (!content.name) {
    errors.push("Content must have a name");
  }

  if (!content.type) {
    errors.push("Content must have a type");
  }

  if (!content.state) {
    errors.push("Content must have a state");
  }

  // Recursively validate children
  if (Array.isArray(content.children)) {
    content.children.forEach((child, index) => {
      const childValidation = validateCourseContent(child);
      if (!childValidation.isValid) {
        errors.push(`Child ${index}: ${childValidation.errors.join(", ")}`);
      }
    });
  }

  return { isValid: errors.length === 0, errors };
}

/**
 * Gets statistics about a course's content structure.
 * @param course - The course to analyze
 * @returns Object containing various statistics about the course
 */
export function getCourseStatistics(course: Course): {
  totalContents: number;
  leafContents: number;
  maxDepth: number;
  contentsByType: Record<string, number>;
  completionBreakdown: Record<string, number>;
} {
  if (!course?.contents) {
    return {
      totalContents: 0,
      leafContents: 0,
      maxDepth: 0,
      contentsByType: {},
      completionBreakdown: {},
    };
  }

  const allContents = flattenContents(course.contents);
  const leafContents = allContents.length;

  // Calculate content types
  const contentsByType: Record<string, number> = {};
  allContents.forEach((content) => {
    const type = content.type || "UNKNOWN";
    contentsByType[type] = (contentsByType[type] || 0) + 1;
  });

  // Calculate completion breakdown
  const completionBreakdown: Record<string, number> = {};
  allContents.forEach((content) => {
    const status = completionStatusToString(content.state?.completionStatus ?? CompletionStatus.Unknown);
    completionBreakdown[status] = (completionBreakdown[status] || 0) + 1;
  });

  // Calculate max depth
  const calculateDepth = (contents: CourseContent[], currentDepth = 0): number => {
    if (!contents || contents.length === 0) return currentDepth;

    return Math.max(
      ...contents.map((content) => {
        if (Array.isArray(content.children) && content.children.length > 0) {
          return calculateDepth(content.children, currentDepth + 1);
        }
        return currentDepth + 1;
      }),
    );
  };

  const maxDepth = calculateDepth(course.contents);

  return {
    totalContents: course.contents.length,
    leafContents,
    maxDepth,
    contentsByType,
    completionBreakdown,
  };
}
