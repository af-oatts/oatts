import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { CertificatePage } from "./CertificatePage";
import * as useCourseContentStatesModule from "@/contexts/hooks/useCourseContentStates";
import * as useRequiredAndOptionalCoursesModule from "@/contexts/hooks/useRequiredAndOptionalCourses";
import * as ModuleUtilsModule from "@/core/modules/ModuleUtils";
import { CompletionStatus, Course, CourseContentItemType } from "@/core/model/OattsModel";
import { ContentStateMap } from "@/contexts/models/ContentStateMap";

// Mock the dependencies
vi.mock("@/contexts/hooks/useCourseContentStates");
vi.mock("@/contexts/hooks/useRequiredAndOptionalCourses");
vi.mock("@/core/modules/ModuleUtils");
vi.mock("@/components/common/BigLoadingScreen", () => ({
  BigLoadingScreen: ({ name }: { name?: string }) => <div data-testid="loading-screen">Loading {name}</div>,
}));
vi.mock("@/components/module/CourseCompletionView", () => ({
  CourseCompletionView: () => <div data-testid="course-completion-view">Course Completion View</div>,
}));

describe("CertificatePage Component", () => {
  const mockCourses: Course[] = [
    {
      id: "course-1",
      name: "Test Course 1",
      description: "Test Description",
      img: "test.png",
      roleIds: ["role-1"],
      contents: [
        {
          id: "content-1",
          name: "Content 1",
          entrypoint: "index.html",
          type: CourseContentItemType.SCORM,
          children: [],
        },
      ],
    },
  ];

  const mockStates: ContentStateMap = {
    "content-1": {
      contentID: "content-1",
      completionStatus: CompletionStatus.Completed,
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Loading State", () => {
    it("should display loading screen when isLoading is true", () => {
      vi.spyOn(useRequiredAndOptionalCoursesModule, "useRequiredAndOptionalCourses").mockReturnValue({
        required: mockCourses,
        optional: [],
      });

      vi.spyOn(useCourseContentStatesModule, "useCourseContentStates").mockReturnValue([undefined, true]);

      render(<CertificatePage />);

      expect(screen.getByTestId("loading-screen")).toBeInTheDocument();
      expect(screen.getByText("Loading certificate")).toBeInTheDocument();
    });

    it("should not display completion view while loading", () => {
      vi.spyOn(useRequiredAndOptionalCoursesModule, "useRequiredAndOptionalCourses").mockReturnValue({
        required: mockCourses,
        optional: [],
      });

      vi.spyOn(useCourseContentStatesModule, "useCourseContentStates").mockReturnValue([undefined, true]);

      render(<CertificatePage />);

      expect(screen.queryByTestId("course-completion-view")).not.toBeInTheDocument();
    });
  });

  describe("Incomplete Requirements", () => {
    it("should check requirements when not loading", () => {
      const incompleteStates: ContentStateMap = {
        "content-1": {
          contentID: "content-1",
          completionStatus: CompletionStatus.Started,
        },
      };

      vi.spyOn(useRequiredAndOptionalCoursesModule, "useRequiredAndOptionalCourses").mockReturnValue({
        required: mockCourses,
        optional: [],
      });

      vi.spyOn(useCourseContentStatesModule, "useCourseContentStates").mockReturnValue([incompleteStates, false]);

      const checkSpy = vi.spyOn(ModuleUtilsModule, "checkIfRequirementsAreComplete").mockReturnValue(false);

      // Expect the component to throw due to Navigate being used outside RouterProvider
      expect(() => render(<CertificatePage />)).toThrow();

      // Verify the check was called with correct parameters
      expect(checkSpy).toHaveBeenCalledWith(mockCourses, incompleteStates);
    });

    it("should attempt navigation to dashboard when requirements incomplete", () => {
      const incompleteStates: ContentStateMap = {
        "content-1": {
          contentID: "content-1",
          completionStatus: CompletionStatus.NotStarted,
        },
      };

      vi.spyOn(useRequiredAndOptionalCoursesModule, "useRequiredAndOptionalCourses").mockReturnValue({
        required: mockCourses,
        optional: [],
      });

      vi.spyOn(useCourseContentStatesModule, "useCourseContentStates").mockReturnValue([incompleteStates, false]);

      vi.spyOn(ModuleUtilsModule, "checkIfRequirementsAreComplete").mockReturnValue(false);

      // Navigate component will throw without router context
      expect(() => render(<CertificatePage />)).toThrow();
    });
  });

  describe("Complete Requirements", () => {
    it("should display CourseCompletionView when requirements are complete", async () => {
      vi.spyOn(useRequiredAndOptionalCoursesModule, "useRequiredAndOptionalCourses").mockReturnValue({
        required: mockCourses,
        optional: [],
      });

      vi.spyOn(useCourseContentStatesModule, "useCourseContentStates").mockReturnValue([mockStates, false]);

      vi.spyOn(ModuleUtilsModule, "checkIfRequirementsAreComplete").mockReturnValue(true);

      render(<CertificatePage />);

      await waitFor(() => {
        expect(screen.getByTestId("course-completion-view")).toBeInTheDocument();
      });
    });

    it("should not display loading screen when complete", () => {
      vi.spyOn(useRequiredAndOptionalCoursesModule, "useRequiredAndOptionalCourses").mockReturnValue({
        required: mockCourses,
        optional: [],
      });

      vi.spyOn(useCourseContentStatesModule, "useCourseContentStates").mockReturnValue([mockStates, false]);

      vi.spyOn(ModuleUtilsModule, "checkIfRequirementsAreComplete").mockReturnValue(true);

      render(<CertificatePage />);

      expect(screen.queryByTestId("loading-screen")).not.toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty required courses", () => {
      vi.spyOn(useRequiredAndOptionalCoursesModule, "useRequiredAndOptionalCourses").mockReturnValue({
        required: [],
        optional: [],
      });

      vi.spyOn(useCourseContentStatesModule, "useCourseContentStates").mockReturnValue([{}, false]);

      vi.spyOn(ModuleUtilsModule, "checkIfRequirementsAreComplete").mockReturnValue(true);

      render(<CertificatePage />);

      expect(screen.getByTestId("course-completion-view")).toBeInTheDocument();
    });

    it("should handle undefined states", () => {
      vi.spyOn(useRequiredAndOptionalCoursesModule, "useRequiredAndOptionalCourses").mockReturnValue({
        required: mockCourses,
        optional: [],
      });

      vi.spyOn(useCourseContentStatesModule, "useCourseContentStates").mockReturnValue([undefined, false]);

      vi.spyOn(ModuleUtilsModule, "checkIfRequirementsAreComplete").mockReturnValue(false);

      expect(() => render(<CertificatePage />)).toThrow();
    });
  });

  describe("Content Flattening", () => {
    it("should flatten course contents correctly", () => {
      const coursesWithMultipleContent: Course[] = [
        {
          id: "course-1",
          name: "Test Course",
          description: "Test",
          img: "test.png",
          roleIds: ["role-1"],
          contents: [
            {
              id: "content-1",
              name: "Content 1",
              entrypoint: "index.html",
              type: CourseContentItemType.SCORM,
              children: [],
            },
            {
              id: "content-2",
              name: "Content 2",
              entrypoint: "index.html",
              type: CourseContentItemType.PDF,
              children: [],
            },
          ],
        },
      ];

      vi.spyOn(useRequiredAndOptionalCoursesModule, "useRequiredAndOptionalCourses").mockReturnValue({
        required: coursesWithMultipleContent,
        optional: [],
      });

      const statesSpy = vi
        .spyOn(useCourseContentStatesModule, "useCourseContentStates")
        .mockReturnValue([mockStates, false]);

      vi.spyOn(ModuleUtilsModule, "checkIfRequirementsAreComplete").mockReturnValue(false);

      expect(() => render(<CertificatePage />)).toThrow();

      // Verify useCourseContentStates was called with flattened contents
      expect(statesSpy).toHaveBeenCalledWith([
        coursesWithMultipleContent[0].contents[0],
        coursesWithMultipleContent[0].contents[1],
      ]);
    });

    it("should handle multiple required courses", () => {
      const multipleCourses: Course[] = [
        {
          id: "course-1",
          name: "Course 1",
          description: "Test",
          img: "test.png",
          roleIds: ["role-1"],
          contents: [
            {
              id: "content-1",
              name: "Content 1",
              entrypoint: "index.html",
              type: CourseContentItemType.SCORM,
              children: [],
            },
          ],
        },
        {
          id: "course-2",
          name: "Course 2",
          description: "Test",
          img: "test.png",
          roleIds: ["role-1"],
          contents: [
            {
              id: "content-2",
              name: "Content 2",
              entrypoint: "index.html",
              type: CourseContentItemType.HTML,
              children: [],
            },
          ],
        },
      ];

      const multipleStates: ContentStateMap = {
        "content-1": {
          contentID: "content-1",
          completionStatus: CompletionStatus.Completed,
        },
        "content-2": {
          contentID: "content-2",
          completionStatus: CompletionStatus.Completed,
        },
      };

      vi.spyOn(useRequiredAndOptionalCoursesModule, "useRequiredAndOptionalCourses").mockReturnValue({
        required: multipleCourses,
        optional: [],
      });

      vi.spyOn(useCourseContentStatesModule, "useCourseContentStates").mockReturnValue([multipleStates, false]);

      vi.spyOn(ModuleUtilsModule, "checkIfRequirementsAreComplete").mockReturnValue(true);

      render(<CertificatePage />);

      expect(screen.getByTestId("course-completion-view")).toBeInTheDocument();
    });
  });

  describe("Completion Status Variations", () => {
    it("should handle partially completed courses", () => {
      const partialStates: ContentStateMap = {
        "content-1": {
          contentID: "content-1",
          completionStatus: CompletionStatus.Started,
        },
      };

      vi.spyOn(useRequiredAndOptionalCoursesModule, "useRequiredAndOptionalCourses").mockReturnValue({
        required: mockCourses,
        optional: [],
      });

      vi.spyOn(useCourseContentStatesModule, "useCourseContentStates").mockReturnValue([partialStates, false]);

      vi.spyOn(ModuleUtilsModule, "checkIfRequirementsAreComplete").mockReturnValue(false);

      expect(() => render(<CertificatePage />)).toThrow();
    });

    it("should handle unknown completion status", () => {
      const unknownStates: ContentStateMap = {
        "content-1": {
          contentID: "content-1",
          completionStatus: CompletionStatus.Unknown,
        },
      };

      vi.spyOn(useRequiredAndOptionalCoursesModule, "useRequiredAndOptionalCourses").mockReturnValue({
        required: mockCourses,
        optional: [],
      });

      vi.spyOn(useCourseContentStatesModule, "useCourseContentStates").mockReturnValue([unknownStates, false]);

      vi.spyOn(ModuleUtilsModule, "checkIfRequirementsAreComplete").mockReturnValue(false);

      expect(() => render(<CertificatePage />)).toThrow();
    });
  });

  describe("Hook Integration", () => {
    it("should call useRequiredAndOptionalCourses hook", () => {
      const hookSpy = vi.spyOn(useRequiredAndOptionalCoursesModule, "useRequiredAndOptionalCourses").mockReturnValue({
        required: mockCourses,
        optional: [],
      });

      vi.spyOn(useCourseContentStatesModule, "useCourseContentStates").mockReturnValue([mockStates, false]);

      vi.spyOn(ModuleUtilsModule, "checkIfRequirementsAreComplete").mockReturnValue(true);

      render(<CertificatePage />);

      expect(hookSpy).toHaveBeenCalled();
    });

    it("should call useCourseContentStates with flattened contents", () => {
      vi.spyOn(useRequiredAndOptionalCoursesModule, "useRequiredAndOptionalCourses").mockReturnValue({
        required: mockCourses,
        optional: [],
      });

      const statesSpy = vi
        .spyOn(useCourseContentStatesModule, "useCourseContentStates")
        .mockReturnValue([mockStates, false]);

      vi.spyOn(ModuleUtilsModule, "checkIfRequirementsAreComplete").mockReturnValue(true);

      render(<CertificatePage />);

      expect(statesSpy).toHaveBeenCalledWith(mockCourses.flatMap((x) => x.contents));
    });

    it("should call checkIfRequirementsAreComplete with correct parameters", () => {
      vi.spyOn(useRequiredAndOptionalCoursesModule, "useRequiredAndOptionalCourses").mockReturnValue({
        required: mockCourses,
        optional: [],
      });

      vi.spyOn(useCourseContentStatesModule, "useCourseContentStates").mockReturnValue([mockStates, false]);

      const checkSpy = vi.spyOn(ModuleUtilsModule, "checkIfRequirementsAreComplete").mockReturnValue(true);

      render(<CertificatePage />);

      expect(checkSpy).toHaveBeenCalledWith(mockCourses, mockStates);
    });
  });
});
