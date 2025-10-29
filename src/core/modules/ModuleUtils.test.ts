import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  calculateCourseCompletionStatus,
  calculateMultiContentCompletionStatus,
  checkIfRequirementsAreComplete,
  calculateContentCompletionStatus,
  reduceCompletionStatus,
  completionStatusToString,
  calculateCoursesProgress,
  flattenContents,
  getContentURL,
  getCourseImageURL,
  validateCourseContent,
  getCourseStatistics,
} from "./ModuleUtils";
import { CompletionStatus, CourseContent, Course, ContentState, CourseContentItemType } from "@/core/model/OattsModel";

// Mock the Globals module
vi.mock("../utils/Globals", () => ({
  OATTS_ROOT: "/test-oatts",
}));

describe("ModuleUtils", () => {
  let mockContentState: ContentState;
  let mockCourse: Course;
  let mockContent: CourseContent;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});

    mockContentState = new ContentState();
    mockContentState.completionStatus = CompletionStatus.NotStarted;

    mockContent = {
      id: "content-1",
      name: "Test Content",
      type: CourseContentItemType.SCORM,
      entrypoint: "index.html",
      state: mockContentState,
    };

    mockCourse = {
      id: "course-1",
      name: "Test Course",
      roleIds: ["role-1"],
      contents: [mockContent],
      img: "test-image.png",
    };
  });

  describe("calculateCourseCompletionStatus", () => {
    it("should throw error for null course", () => {
      expect(() => calculateCourseCompletionStatus(null as any)).toThrow("Course cannot be null or undefined");
    });

    it("should throw error for undefined course", () => {
      expect(() => calculateCourseCompletionStatus(undefined as any)).toThrow("Course cannot be null or undefined");
    });

    it("should return NotStarted for course with no contents", () => {
      const emptyCourse = { ...mockCourse, contents: [] };
      expect(calculateCourseCompletionStatus(emptyCourse)).toBe(CompletionStatus.NotStarted);
    });

    it("should return NotStarted for course with undefined contents", () => {
      const emptyCourse = { ...mockCourse, contents: undefined as any };
      expect(calculateCourseCompletionStatus(emptyCourse)).toBe(CompletionStatus.NotStarted);
    });

    it("should calculate completion status for course with contents", () => {
      mockContentState.completionStatus = CompletionStatus.Completed;
      expect(calculateCourseCompletionStatus(mockCourse)).toBe(CompletionStatus.Completed);
    });
  });

  describe("calculateMultiContentCompletionStatus", () => {
    it("should return NotStarted for empty array", () => {
      expect(calculateMultiContentCompletionStatus([])).toBe(CompletionStatus.NotStarted);
    });

    it("should return NotStarted for null/undefined array", () => {
      expect(calculateMultiContentCompletionStatus(null as any)).toBe(CompletionStatus.NotStarted);
      expect(calculateMultiContentCompletionStatus(undefined as any)).toBe(CompletionStatus.NotStarted);
    });

    it("should calculate status for multiple contents", () => {
      const content1 = { ...mockContent, id: "content-1" };
      const content2 = { ...mockContent, id: "content-2", state: new ContentState() };

      content1.state.completionStatus = CompletionStatus.Completed;
      content2.state.completionStatus = CompletionStatus.Started;

      expect(calculateMultiContentCompletionStatus([content1, content2])).toBe(CompletionStatus.Started);
    });
  });

  describe("checkIfRequirementsAreComplete", () => {
    it("should return true for empty courses array", () => {
      expect(checkIfRequirementsAreComplete([])).toBe(true);
    });

    it("should return true for null/undefined courses", () => {
      expect(checkIfRequirementsAreComplete(null as any)).toBe(true);
      expect(checkIfRequirementsAreComplete(undefined as any)).toBe(true);
    });

    it("should return true when all courses are completed", () => {
      mockContentState.completionStatus = CompletionStatus.Completed;
      expect(checkIfRequirementsAreComplete([mockCourse])).toBe(true);
    });

    it("should return false when some courses are not completed", () => {
      mockContentState.completionStatus = CompletionStatus.Started;
      expect(checkIfRequirementsAreComplete([mockCourse])).toBe(false);
    });

    it("should handle errors gracefully and return false", () => {
      const invalidCourse = null as any;
      expect(checkIfRequirementsAreComplete([invalidCourse])).toBe(false);
      expect(console.warn).toHaveBeenCalled();
    });
  });

  describe("calculateContentCompletionStatus", () => {
    it("should return Unknown for null/undefined content", () => {
      expect(calculateContentCompletionStatus(null as any)).toBe(CompletionStatus.Unknown);
      expect(calculateContentCompletionStatus(undefined as any)).toBe(CompletionStatus.Unknown);
    });

    it("should return content's own status for leaf nodes", () => {
      mockContentState.completionStatus = CompletionStatus.Started;
      expect(calculateContentCompletionStatus(mockContent)).toBe(CompletionStatus.Started);
    });

    it("should return Unknown for content with no state", () => {
      const contentWithoutState = { ...mockContent, state: undefined as any };
      expect(calculateContentCompletionStatus(contentWithoutState)).toBe(CompletionStatus.Unknown);
    });

    it("should recursively calculate status for content with children", () => {
      const child1 = { ...mockContent, id: "child-1", state: new ContentState() };
      const child2 = { ...mockContent, id: "child-2", state: new ContentState() };

      child1.state.completionStatus = CompletionStatus.Completed;
      child2.state.completionStatus = CompletionStatus.Started;

      const parentContent = {
        ...mockContent,
        id: "parent",
        children: [child1, child2],
      };

      expect(calculateContentCompletionStatus(parentContent)).toBe(CompletionStatus.Started);
    });

    it("should handle empty children array", () => {
      const parentContent = { ...mockContent, children: [] };
      expect(calculateContentCompletionStatus(parentContent)).toBe(CompletionStatus.NotStarted);
    });
  });

  describe("reduceCompletionStatus", () => {
    it("should return NotStarted for empty array", () => {
      expect(reduceCompletionStatus([])).toBe(CompletionStatus.NotStarted);
    });

    it("should return NotStarted for null/undefined array", () => {
      expect(reduceCompletionStatus(null as any)).toBe(CompletionStatus.NotStarted);
      expect(reduceCompletionStatus(undefined as any)).toBe(CompletionStatus.NotStarted);
    });

    it("should return Completed when all statuses are Completed", () => {
      const statuses = [CompletionStatus.Completed, CompletionStatus.Completed];
      expect(reduceCompletionStatus(statuses)).toBe(CompletionStatus.Completed);
    });

    it("should return Started when some are Started or Completed", () => {
      const statuses = [CompletionStatus.Started, CompletionStatus.NotStarted];
      expect(reduceCompletionStatus(statuses)).toBe(CompletionStatus.Started);
    });

    it("should return NotStarted when all are NotStarted", () => {
      const statuses = [CompletionStatus.NotStarted, CompletionStatus.NotStarted];
      expect(reduceCompletionStatus(statuses)).toBe(CompletionStatus.NotStarted);
    });

    it("should return Unknown when all statuses are Unknown", () => {
      const statuses = [CompletionStatus.Unknown, CompletionStatus.Unknown];
      expect(reduceCompletionStatus(statuses)).toBe(CompletionStatus.Unknown);
    });

    it("should ignore Unknown statuses when other statuses are present", () => {
      const statuses = [CompletionStatus.Unknown, CompletionStatus.Completed];
      expect(reduceCompletionStatus(statuses)).toBe(CompletionStatus.Completed);
    });
  });

  describe("completionStatusToString", () => {
    it("should convert all completion statuses to strings", () => {
      expect(completionStatusToString(CompletionStatus.Unknown)).toBe("Unknown");
      expect(completionStatusToString(CompletionStatus.NotStarted)).toBe("Not Started");
      expect(completionStatusToString(CompletionStatus.Started)).toBe("In Progress");
      expect(completionStatusToString(CompletionStatus.Completed)).toBe("Completed");
    });

    it("should handle invalid status values", () => {
      expect(completionStatusToString(999 as CompletionStatus)).toBe("Unknown");
      expect(console.warn).toHaveBeenCalledWith("Unknown completion status: 999");
    });
  });

  describe("calculateCoursesProgress", () => {
    it("should return 0 for empty courses array", () => {
      expect(calculateCoursesProgress([])).toBe(0);
    });

    it("should return 0 for null/undefined courses", () => {
      expect(calculateCoursesProgress(null as any)).toBe(0);
      expect(calculateCoursesProgress(undefined as any)).toBe(0);
    });

    it("should calculate progress for single course", () => {
      mockContentState.completionStatus = CompletionStatus.Completed;
      expect(calculateCoursesProgress([mockCourse])).toBe(1);
    });

    it("should calculate average progress for multiple courses", () => {
      const course1 = { ...mockCourse, id: "course-1" };
      const course2 = { ...mockCourse, id: "course-2", contents: [{ ...mockContent, state: new ContentState() }] };

      course1.contents[0].state.completionStatus = CompletionStatus.Completed;
      course2.contents[0].state.completionStatus = CompletionStatus.Started;

      const progress = calculateCoursesProgress([course1, course2]);
      expect(progress).toBe(0.75); // (1 + 0.5) / 2
    });

    it("should handle invalid course data gracefully", () => {
      // Create a course with invalid content that should return 0 progress
      const invalidCourse = {
        ...mockCourse,
        contents: [
          {
            ...mockContent,
            state: null as any, // This will be handled gracefully and return Unknown status
          },
        ],
      };
      // Should return 0 for courses with invalid data
      expect(calculateCoursesProgress([invalidCourse])).toBe(0);
    });
  });

  describe("flattenContents", () => {
    it("should return empty array for null/undefined/empty input", () => {
      expect(flattenContents([])).toEqual([]);
      expect(flattenContents(null as any)).toEqual([]);
      expect(flattenContents(undefined as any)).toEqual([]);
    });

    it("should return leaf contents for flat structure", () => {
      const contents = [mockContent];
      expect(flattenContents(contents)).toEqual([mockContent]);
    });

    it("should flatten nested content structure", () => {
      const child1 = { ...mockContent, id: "child-1" };
      const child2 = { ...mockContent, id: "child-2" };
      const parent = { ...mockContent, id: "parent", children: [child1, child2] };

      expect(flattenContents([parent])).toEqual([child1, child2]);
    });

    it("should handle deeply nested structures", () => {
      const grandchild = { ...mockContent, id: "grandchild" };
      const child = { ...mockContent, id: "child", children: [grandchild] };
      const parent = { ...mockContent, id: "parent", children: [child] };

      expect(flattenContents([parent])).toEqual([grandchild]);
    });
  });

  describe("getContentURL", () => {
    it("should generate correct URL for valid content", () => {
      expect(getContentURL(mockContent)).toBe("/test-oatts/content/content-1/index.html");
    });

    it("should throw error for null/undefined content", () => {
      expect(() => getContentURL(null as any)).toThrow("Content cannot be null or undefined");
      expect(() => getContentURL(undefined as any)).toThrow("Content cannot be null or undefined");
    });

    it("should throw error for content without ID", () => {
      const contentWithoutId = { ...mockContent, id: "" };
      expect(() => getContentURL(contentWithoutId)).toThrow("Content must have an ID");
    });

    it("should throw error for content without entrypoint", () => {
      const contentWithoutEntrypoint = { ...mockContent, entrypoint: undefined };
      expect(() => getContentURL(contentWithoutEntrypoint)).toThrow("Content must have an entrypoint");
    });
  });

  describe("getCourseImageURL", () => {
    it("should generate correct URL for course with image", () => {
      expect(getCourseImageURL(mockCourse)).toBe("/test-oatts/assets/test-image.png");
    });

    it("should return null for course without image", () => {
      const courseWithoutImage = { ...mockCourse, img: undefined };
      expect(getCourseImageURL(courseWithoutImage)).toBeNull();
    });

    it("should return null for null/undefined course", () => {
      expect(getCourseImageURL(null as any)).toBeNull();
      expect(getCourseImageURL(undefined as any)).toBeNull();
    });
  });

  describe("validateCourseContent", () => {
    it("should validate correct content", () => {
      const result = validateCourseContent(mockContent);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it("should return errors for null/undefined content", () => {
      const result = validateCourseContent(null as any);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Content cannot be null or undefined");
    });

    it("should validate required fields", () => {
      const invalidContent = {
        id: "",
        name: "",
        type: undefined,
        state: undefined,
      } as any;

      const result = validateCourseContent(invalidContent);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Content must have an ID");
      expect(result.errors).toContain("Content must have a name");
      expect(result.errors).toContain("Content must have a type");
      expect(result.errors).toContain("Content must have a state");
    });

    it("should recursively validate children", () => {
      const invalidChild = { ...mockContent, id: "", name: "" };
      const parentContent = { ...mockContent, children: [invalidChild] };

      const result = validateCourseContent(parentContent);
      expect(result.isValid).toBe(false);
      expect(result.errors.some((error) => error.includes("Child 0:"))).toBe(true);
    });
  });

  describe("getCourseStatistics", () => {
    it("should return empty statistics for course without contents", () => {
      const emptyCourse = { ...mockCourse, contents: undefined as any };
      const stats = getCourseStatistics(emptyCourse);

      expect(stats.totalContents).toBe(0);
      expect(stats.leafContents).toBe(0);
      expect(stats.maxDepth).toBe(0);
      expect(stats.contentsByType).toEqual({});
      expect(stats.completionBreakdown).toEqual({});
    });

    it("should calculate statistics for simple course", () => {
      const stats = getCourseStatistics(mockCourse);

      expect(stats.totalContents).toBe(1);
      expect(stats.leafContents).toBe(1);
      expect(stats.maxDepth).toBe(1);
      expect(stats.contentsByType).toEqual({ SCORM: 1 });
      expect(stats.completionBreakdown).toEqual({ "Not Started": 1 });
    });

    it("should calculate statistics for complex course structure", () => {
      const child1 = { ...mockContent, id: "child-1", type: CourseContentItemType.PDF, state: new ContentState() };
      const child2 = { ...mockContent, id: "child-2", type: CourseContentItemType.HTML, state: new ContentState() };
      const parent = { ...mockContent, id: "parent", children: [child1, child2] };

      child1.state.completionStatus = CompletionStatus.Completed;
      child2.state.completionStatus = CompletionStatus.Started;

      const complexCourse = { ...mockCourse, contents: [parent] };
      const stats = getCourseStatistics(complexCourse);

      expect(stats.totalContents).toBe(1);
      expect(stats.leafContents).toBe(2);
      expect(stats.maxDepth).toBe(2);
      expect(stats.contentsByType).toEqual({ PDF: 1, HTML: 1 });
      expect(stats.completionBreakdown).toEqual({ Completed: 1, "In Progress": 1 });
    });
  });
});
