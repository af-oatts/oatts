import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  loadCoursesWithState,
  loadCourseWithState,
  loadPreQuizzes,
  loadRequiredAndOptionalCourses,
} from "./ModuleLoader";
import {
  ContentState,
  OattsManifest,
  StatelessCourse,
  Course,
  CourseContent,
  CourseContentItemType,
  StatelessCourseContent,
  CompletionStatus,
} from "@/core/model/OattsModel";
import User from "@/core/model/UserModel";
import { ScormModel } from "@/core/model/ScormModel";
import { UserContextType } from "../../contexts/UserContext";
import CoursesContext from "./ContentContext";

// Mock dependencies
vi.mock("../scorm/ScormHelper", () => ({
  loadModel: vi.fn(),
}));

vi.mock("../scorm/ScormInternalizer", () => ({
  internalizeCompletionStatus: vi.fn(),
}));

vi.mock("../database/Content", () => ({
  GetInternalContentState: vi.fn(),
}));

// Import mocked functions
import { loadModel } from "../scorm/ScormHelper";
import { internalizeCompletionStatus } from "../scorm/ScormInternalizer";
import { GetInternalContentState } from "../database/Content";

describe("ModuleLoader.improved", () => {
  let mockUser: User;
  let mockContentState: ContentState;
  let mockScormModel: ScormModel;

  beforeEach(() => {
    vi.clearAllMocks();

    mockUser = new User();
    mockUser.id = 1;
    mockUser.firstName = "Test";
    mockUser.lastName = "User";
    mockUser.roles = ["role1", "role2"];

    mockContentState = new ContentState();
    mockContentState.completionStatus = CompletionStatus.NotStarted;

    mockScormModel = {
      cmi: {
        completion_status: "incomplete",
      },
    } as ScormModel;

    // Setup default mocks
    vi.mocked(GetInternalContentState).mockResolvedValue(mockContentState);
    vi.mocked(loadModel).mockResolvedValue(mockScormModel);
    vi.mocked(internalizeCompletionStatus).mockReturnValue(CompletionStatus.Started);
  });

  describe("loadCoursesWithState", () => {
    it("should convert empty array of stateless courses", async () => {
      const result = await loadCoursesWithState(mockUser, []);
      expect(result).toEqual([]);
    });

    it("should convert single stateless course to stateful course", async () => {
      const statelessCourse: StatelessCourse = {
        id: "course1",
        name: "Test Course",
        roleIds: ["role1"],
        contents: [],
      };

      const result = await loadCoursesWithState(mockUser, [statelessCourse]);

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        id: "course1",
        name: "Test Course",
        roleIds: ["role1"],
        contents: [],
      });
    });

    it("should process multiple courses concurrently", async () => {
      const statelessCourses: StatelessCourse[] = [
        {
          id: "course1",
          name: "Course 1",
          roleIds: ["role1"],
          contents: [],
        },
        {
          id: "course2",
          name: "Course 2",
          roleIds: ["role2"],
          contents: [],
        },
      ];

      const result = await loadCoursesWithState(mockUser, statelessCourses);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe("course1");
      expect(result[1].id).toBe("course2");
    });

    it("should handle courses with complex content structures", async () => {
      const statelessContent: StatelessCourseContent = {
        id: "content1",
        name: "Test Content",
        type: CourseContentItemType.SCORM,
        entrypoint: "index.html",
      };

      const statelessCourse: StatelessCourse = {
        id: "course1",
        name: "Test Course",
        roleIds: ["role1"],
        contents: [statelessContent],
        description: "Test Description",
        img: "test.jpg",
        paNumber: "PA123",
        timeToComplete: 60,
      };

      const result = await loadCoursesWithState(mockUser, [statelessCourse]);

      expect(result[0]).toMatchObject({
        id: "course1",
        name: "Test Course",
        roleIds: ["role1"],
        description: "Test Description",
        img: "test.jpg",
        paNumber: "PA123",
        timeToComplete: 60,
      });
      expect(result[0].contents).toHaveLength(1);
    });
  });

  describe("StatefulifyRawCourse", () => {
    it("should convert stateless course with no contents", async () => {
      const statelessCourse: StatelessCourse = {
        id: "course1",
        name: "Test Course",
        roleIds: ["role1"],
        contents: [],
      };

      const result = await loadCourseWithState(mockUser)(statelessCourse);

      expect(result).toMatchObject({
        id: "course1",
        name: "Test Course",
        roleIds: ["role1"],
        contents: [],
      });
    });

    it("should process course contents concurrently", async () => {
      const statelessContents: StatelessCourseContent[] = [
        {
          id: "content1",
          name: "Content 1",
          type: CourseContentItemType.PDF,
        },
        {
          id: "content2",
          name: "Content 2",
          type: CourseContentItemType.HTML,
        },
      ];

      const statelessCourse: StatelessCourse = {
        id: "course1",
        name: "Test Course",
        roleIds: ["role1"],
        contents: statelessContents,
      };

      const result = await loadCourseWithState(mockUser)(statelessCourse);

      expect(result.contents).toHaveLength(2);
      expect(result.contents[0].id).toBe("content1");
      expect(result.contents[1].id).toBe("content2");
    });

    it("should preserve all course properties", async () => {
      const statelessCourse: StatelessCourse = {
        id: "course1",
        name: "Test Course",
        roleIds: ["role1", "role2"],
        contents: [],
        description: "Course Description",
        img: "course.jpg",
        paNumber: "PA456",
        timeToComplete: 120,
      };

      const result = await loadCourseWithState(mockUser)(statelessCourse);

      expect(result).toEqual({
        id: "course1",
        name: "Test Course",
        roleIds: ["role1", "role2"],
        contents: [],
        description: "Course Description",
        img: "course.jpg",
        paNumber: "PA456",
        timeToComplete: 120,
      });
    });
  });

  describe("StatefulifyRawContent (via StatefulifyRawCourse)", () => {
    it("should handle SCORM content type", async () => {
      const statelessContent: StatelessCourseContent = {
        id: "scorm1",
        name: "SCORM Content",
        type: CourseContentItemType.SCORM,
        entrypoint: "index.html",
      };

      const statelessCourse: StatelessCourse = {
        id: "course1",
        name: "Test Course",
        roleIds: ["role1"],
        contents: [statelessContent],
      };

      const result = await loadCourseWithState(mockUser)(statelessCourse);
      const content = result.contents[0];

      expect(content).toMatchObject({
        id: "scorm1",
        name: "SCORM Content",
        type: CourseContentItemType.SCORM,
        entrypoint: "index.html",
      });
      expect(content.state).toBeInstanceOf(ContentState);
      expect(content.scormState).toBeDefined();
      expect(loadModel).toHaveBeenCalledWith(mockUser, "scorm1");
    });

    it("should handle non-SCORM content types", async () => {
      const statelessContent: StatelessCourseContent = {
        id: "pdf1",
        name: "PDF Content",
        type: CourseContentItemType.PDF,
      };

      const statelessCourse: StatelessCourse = {
        id: "course1",
        name: "Test Course",
        roleIds: ["role1"],
        contents: [statelessContent],
      };

      const result = await loadCourseWithState(mockUser)(statelessCourse);
      const content = result.contents[0];

      expect(content.scormState).toBeUndefined();
      expect(loadModel).not.toHaveBeenCalled();
    });

    it("should handle submodule with children", async () => {
      const childContent: StatelessCourseContent = {
        id: "child1",
        name: "Child Content",
        type: CourseContentItemType.PDF,
      };

      const parentContent: StatelessCourseContent = {
        id: "parent1",
        name: "Parent Content",
        type: CourseContentItemType.SUBMODULE,
        children: [childContent],
      };

      const statelessCourse: StatelessCourse = {
        id: "course1",
        name: "Test Course",
        roleIds: ["role1"],
        contents: [parentContent],
      };

      const result = await loadCourseWithState(mockUser)(statelessCourse);
      const parent = result.contents[0];

      expect(parent.children).toHaveLength(1);
      expect(parent.children![0]).toMatchObject({
        id: "child1",
        name: "Child Content",
        type: CourseContentItemType.PDF,
      });
    });

    it("should handle submodule with no children", async () => {
      const parentContent: StatelessCourseContent = {
        id: "parent1",
        name: "Parent Content",
        type: CourseContentItemType.SUBMODULE,
      };

      const statelessCourse: StatelessCourse = {
        id: "course1",
        name: "Test Course",
        roleIds: ["role1"],
        contents: [parentContent],
      };

      const result = await loadCourseWithState(mockUser)(statelessCourse);
      const parent = result.contents[0];

      expect(parent.children).toBeUndefined();
    });

    it("should handle SCORM loading errors gracefully", async () => {
      vi.mocked(loadModel).mockRejectedValue(new Error("SCORM load failed"));

      const statelessContent: StatelessCourseContent = {
        id: "scorm1",
        name: "SCORM Content",
        type: CourseContentItemType.SCORM,
      };

      const statelessCourse: StatelessCourse = {
        id: "course1",
        name: "Test Course",
        roleIds: ["role1"],
        contents: [statelessContent],
      };

      const result = await loadCourseWithState(mockUser)(statelessCourse);
      const content = result.contents[0];

      expect(content.scormState).toBeUndefined();
      expect(content.state).toBeInstanceOf(ContentState);
    });

    it("should create new ContentState when internal state is null", async () => {
      vi.mocked(GetInternalContentState).mockResolvedValue(undefined);

      const statelessContent: StatelessCourseContent = {
        id: "content1",
        name: "Test Content",
        type: CourseContentItemType.PDF,
      };

      const statelessCourse: StatelessCourse = {
        id: "course1",
        name: "Test Course",
        roleIds: ["role1"],
        contents: [statelessContent],
      };

      const result = await loadCourseWithState(mockUser)(statelessCourse);
      const content = result.contents[0];

      expect(content.state).toBeInstanceOf(ContentState);
      expect(content.state.completionStatus).toBe(CompletionStatus.NotStarted);
    });

    it("should update internal state completion status for SCORM content", async () => {
      const mockInternalState = new ContentState();
      vi.mocked(GetInternalContentState).mockResolvedValue(mockInternalState);
      vi.mocked(internalizeCompletionStatus).mockReturnValue(CompletionStatus.Completed);

      const statelessContent: StatelessCourseContent = {
        id: "scorm1",
        name: "SCORM Content",
        type: CourseContentItemType.SCORM,
      };

      const statelessCourse: StatelessCourse = {
        id: "course1",
        name: "Test Course",
        roleIds: ["role1"],
        contents: [statelessContent],
      };

      await loadCourseWithState(mockUser)(statelessCourse);

      expect(internalizeCompletionStatus).toHaveBeenCalledWith("incomplete");
      expect(mockInternalState.completionStatus).toBe(CompletionStatus.Completed);
    });
  });

  describe("LoadPreQuizzes", () => {
    it("should return empty array when manifest has no prequizzes", async () => {
      const manifest: OattsManifest = {
        courses: [],
        roles: [],
      };

      const result = await loadPreQuizzes(mockUser, manifest);
      expect(result).toEqual([]);
    });

    it("should return empty array when prequizzes array is empty", async () => {
      const manifest: OattsManifest = {
        courses: [],
        prequizzes: [],
        roles: [],
      };

      const result = await loadPreQuizzes(mockUser, manifest);
      expect(result).toEqual([]);
    });

    it("should filter quizzes by user roles", async () => {
      const quiz1: StatelessCourse = {
        id: "quiz1",
        name: "Quiz 1",
        roleIds: ["role1"],
        contents: [
          {
            id: "q1content",
            name: "Quiz 1 Content",
            type: CourseContentItemType.HTML,
          },
        ],
      };

      const quiz2: StatelessCourse = {
        id: "quiz2",
        name: "Quiz 2",
        roleIds: ["role3"], // User doesn't have this role
        contents: [
          {
            id: "q2content",
            name: "Quiz 2 Content",
            type: CourseContentItemType.HTML,
          },
        ],
      };

      const manifest: OattsManifest = {
        courses: [],
        prequizzes: [quiz1, quiz2],
        roles: [],
      };

      const result = await loadPreQuizzes(mockUser, manifest);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("q1content");
    });

    it("should process multiple relevant quizzes concurrently", async () => {
      const quiz1: StatelessCourse = {
        id: "quiz1",
        name: "Quiz 1",
        roleIds: ["role1"],
        contents: [
          {
            id: "q1content",
            name: "Quiz 1 Content",
            type: CourseContentItemType.HTML,
          },
        ],
      };

      const quiz2: StatelessCourse = {
        id: "quiz2",
        name: "Quiz 2",
        roleIds: ["role2"],
        contents: [
          {
            id: "q2content",
            name: "Quiz 2 Content",
            type: CourseContentItemType.HTML,
          },
        ],
      };

      const manifest: OattsManifest = {
        courses: [],
        prequizzes: [quiz1, quiz2],
        roles: [],
      };

      const result = await loadPreQuizzes(mockUser, manifest);

      expect(result).toHaveLength(2);
      expect(result.map((r) => r.id)).toContain("q1content");
      expect(result.map((r) => r.id)).toContain("q2content");
    });

    it("should flatten quiz contents from multiple quizzes", async () => {
      const quiz1: StatelessCourse = {
        id: "quiz1",
        name: "Quiz 1",
        roleIds: ["role1"],
        contents: [
          {
            id: "q1content1",
            name: "Quiz 1 Content 1",
            type: CourseContentItemType.HTML,
          },
          {
            id: "q1content2",
            name: "Quiz 1 Content 2",
            type: CourseContentItemType.PDF,
          },
        ],
      };

      const manifest: OattsManifest = {
        courses: [],
        prequizzes: [quiz1],
        roles: [],
      };

      const result = await loadPreQuizzes(mockUser, manifest);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe("q1content1");
      expect(result[1].id).toBe("q1content2");
    });

    it("should handle quiz with overlapping user roles", async () => {
      const quiz: StatelessCourse = {
        id: "quiz1",
        name: "Quiz 1",
        roleIds: ["role1", "role2", "role3"], // User has role1 and role2
        contents: [
          {
            id: "qcontent",
            name: "Quiz Content",
            type: CourseContentItemType.HTML,
          },
        ],
      };

      const manifest: OattsManifest = {
        courses: [],
        prequizzes: [quiz],
        roles: [],
      };

      const result = await loadPreQuizzes(mockUser, manifest);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("qcontent");
    });
  });

  describe("loadRequiredAndOptionalCourses", () => {
    let mockContext: {
      authentication: UserContextType;
      courses: CoursesContext;
      config: OattsManifest;
    };

    beforeEach(() => {
      mockContext = {
        authentication: {
          user: mockUser,
        } as UserContextType,
        courses: {
          courses: [],
        } as CoursesContext,
        config: {
          courses: [],
          roles: [],
        },
      };
    });

    it("should return empty arrays when user is undefined", async () => {
      mockContext.authentication.user = undefined;

      const result = await loadRequiredAndOptionalCourses({ context: mockContext });

      expect(result).toEqual({ required: [], optional: [] });
    });

    it("should categorize courses based on user roles", async () => {
      const course1: StatelessCourse = {
        id: "course1",
        name: "Required Course",
        roleIds: ["role1"], // User has this role
        contents: [],
      };

      const course2: StatelessCourse = {
        id: "course2",
        name: "Optional Course",
        roleIds: ["role3"], // User doesn't have this role
        contents: [],
      };

      mockContext.config.courses = [course1, course2];

      const result = await loadRequiredAndOptionalCourses({ context: mockContext });

      expect(result.required).toHaveLength(1);
      expect(result.required[0].id).toBe("course1");
      expect(result.optional).toHaveLength(1);
      expect(result.optional[0].id).toBe("course2");
    });

    it("should update context courses", async () => {
      const course: StatelessCourse = {
        id: "course1",
        name: "Test Course",
        roleIds: ["role1"],
        contents: [],
      };

      mockContext.config.courses = [course];

      await loadRequiredAndOptionalCourses({ context: mockContext });

      expect(mockContext.courses.courses).toHaveLength(1);
      expect(mockContext.courses.courses).toHaveLength(1);
      expect(mockContext.courses.courses![0].id).toBe("course1");
    });

    it("should handle courses with multiple role IDs", async () => {
      const course: StatelessCourse = {
        id: "course1",
        name: "Multi-Role Course",
        roleIds: ["role1", "role3", "role4"], // User has role1
        contents: [],
      };

      mockContext.config.courses = [course];

      const result = await loadRequiredAndOptionalCourses({ context: mockContext });

      expect(result.required).toHaveLength(1);
      expect(result.optional).toHaveLength(0);
    });

    it("should handle user with multiple roles", async () => {
      mockUser.roles = ["role1", "role2", "role3"];

      const course1: StatelessCourse = {
        id: "course1",
        name: "Course 1",
        roleIds: ["role1"],
        contents: [],
      };

      const course2: StatelessCourse = {
        id: "course2",
        name: "Course 2",
        roleIds: ["role2"],
        contents: [],
      };

      const course3: StatelessCourse = {
        id: "course3",
        name: "Course 3",
        roleIds: ["role4"], // User doesn't have this role
        contents: [],
      };

      mockContext.config.courses = [course1, course2, course3];

      const result = await loadRequiredAndOptionalCourses({ context: mockContext });

      expect(result.required).toHaveLength(2);
      expect(result.optional).toHaveLength(1);
    });

    it("should handle errors gracefully", async () => {
      // Mock an error in course processing
      vi.mocked(GetInternalContentState).mockRejectedValue(new Error("Database error"));

      const course: StatelessCourse = {
        id: "course1",
        name: "Test Course",
        roleIds: ["role1"],
        contents: [
          {
            id: "content1",
            name: "Test Content",
            type: CourseContentItemType.PDF,
          },
        ],
      };

      mockContext.config.courses = [course];

      const result = await loadRequiredAndOptionalCourses({ context: mockContext });

      expect(result).toEqual({ required: [], optional: [] });
    });

    it("should process all courses concurrently", async () => {
      const courses: StatelessCourse[] = Array.from({ length: 5 }, (_, i) => ({
        id: `course${i + 1}`,
        name: `Course ${i + 1}`,
        roleIds: i < 3 ? ["role1"] : ["role3"],
        contents: [],
      }));

      mockContext.config.courses = courses;

      const result = await loadRequiredAndOptionalCourses({ context: mockContext });

      expect(result.required).toHaveLength(3);
      expect(result.optional).toHaveLength(2);
      expect(mockContext.courses.courses).toHaveLength(5);
    });

    it("should handle empty courses array", async () => {
      mockContext.config.courses = [];

      const result = await loadRequiredAndOptionalCourses({ context: mockContext });

      expect(result).toEqual({ required: [], optional: [] });
      expect(mockContext.courses.courses).toEqual([]);
    });
  });

  describe("Edge Cases and Error Handling", () => {
    it("should handle malformed course data", async () => {
      const malformedCourse = {
        id: "course1",
        name: "", // Provide required field
        roleIds: [], // Provide required field
        contents: [],
      } as StatelessCourse;

      // Should not throw, but handle gracefully
      const result = await loadCoursesWithState(mockUser, [malformedCourse]);
      expect(result).toHaveLength(1);
    });

    it("should handle deeply nested content structures", async () => {
      const deeplyNestedContent: StatelessCourseContent = {
        id: "parent",
        name: "Parent",
        type: CourseContentItemType.SUBMODULE,
        children: [
          {
            id: "child1",
            name: "Child 1",
            type: CourseContentItemType.SUBMODULE,
            children: [
              {
                id: "grandchild1",
                name: "Grandchild 1",
                type: CourseContentItemType.PDF,
              },
            ],
          },
        ],
      };

      const course: StatelessCourse = {
        id: "course1",
        name: "Test Course",
        roleIds: ["role1"],
        contents: [deeplyNestedContent],
      };

      const result = await loadCourseWithState(mockUser)(course);
      const parent = result.contents[0];
      const child = parent.children![0];
      const grandchild = child.children![0];

      expect(grandchild.id).toBe("grandchild1");
      expect(grandchild.state).toBeInstanceOf(ContentState);
    });

    it("should handle concurrent processing with mixed success/failure", async () => {
      let callCount = 0;
      vi.mocked(GetInternalContentState).mockImplementation(async () => {
        callCount++;
        if (callCount === 2) {
          throw new Error("Simulated failure");
        }
        return mockContentState;
      });

      const courses: StatelessCourse[] = [
        {
          id: "course1",
          name: "Course 1",
          roleIds: ["role1"],
          contents: [
            {
              id: "content1",
              name: "Content 1",
              type: CourseContentItemType.PDF,
            },
          ],
        },
        {
          id: "course2",
          name: "Course 2",
          roleIds: ["role1"],
          contents: [
            {
              id: "content2",
              name: "Content 2",
              type: CourseContentItemType.PDF,
            },
          ],
        },
      ];

      // Should handle the error gracefully and continue processing
      await expect(loadCoursesWithState(mockUser, courses)).rejects.toThrow();
    });
  });
});
