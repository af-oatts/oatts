import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { Subject } from "rxjs";
import useCompletionStatus from "./useCompletionStatus";
import { CompletionStatus, CourseContent, ContentState, CourseContentItemType } from "@/core/model/OattsModel";
import { calculateContentCompletionStatus } from "../ModuleUtils";

// Mock the ModuleUtils
vi.mock("../ModuleUtils", () => ({
  calculateContentCompletionStatus: vi.fn(),
}));

describe("useCompletionStatus", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("when contentItem is undefined", () => {
    it("should return CompletionStatus.Unknown", () => {
      const { result } = renderHook(() => useCompletionStatus(undefined));

      expect(result.current).toBe(CompletionStatus.Unknown);
    });

    it("should not call calculateContentCompletionStatus", () => {
      renderHook(() => useCompletionStatus(undefined));

      expect(calculateContentCompletionStatus).not.toHaveBeenCalled();
    });
  });

  describe("when contentItem is provided", () => {
    it("should initialize with calculated completion status", () => {
      const mockContentItem: CourseContent = {
        id: "test-content",
        name: "Test Content",
        type: CourseContentItemType.SCORM,
        state: new ContentState(),
      };

      vi.mocked(calculateContentCompletionStatus).mockReturnValue(CompletionStatus.Started);

      const { result } = renderHook(() => useCompletionStatus(mockContentItem));

      expect(calculateContentCompletionStatus).toHaveBeenCalledWith(mockContentItem);
      expect(result.current).toBe(CompletionStatus.Started);
    });
  });

  describe("when contentItem has no children (leaf node)", () => {
    it("should subscribe to completion status observable and update when status changes", () => {
      const mockState = new ContentState();
      const mockContentItem: CourseContent = {
        id: "test-content",
        name: "Test Content",
        type: CourseContentItemType.SCORM,
        state: mockState,
      };

      vi.mocked(calculateContentCompletionStatus).mockReturnValue(CompletionStatus.NotStarted);

      const { result } = renderHook(() => useCompletionStatus(mockContentItem));

      // Initial status
      expect(result.current).toBe(CompletionStatus.NotStarted);

      // Change the status
      act(() => {
        mockState.completionStatus = CompletionStatus.Started;
      });

      expect(result.current).toBe(CompletionStatus.Started);

      // Change again
      act(() => {
        mockState.completionStatus = CompletionStatus.Completed;
      });

      expect(result.current).toBe(CompletionStatus.Completed);
    });

    it("should unsubscribe from observable on unmount", () => {
      const mockState = new ContentState();
      const mockContentItem: CourseContent = {
        id: "test-content",
        name: "Test Content",
        type: CourseContentItemType.SCORM,
        state: mockState,
      };

      vi.mocked(calculateContentCompletionStatus).mockReturnValue(CompletionStatus.NotStarted);

      const { unmount } = renderHook(() => useCompletionStatus(mockContentItem));

      // Change the status to verify subscription is working
      act(() => {
        mockState.completionStatus = CompletionStatus.Started;
      });

      // Unmount should not cause any errors (subscription cleanup)
      expect(() => unmount()).not.toThrow();
    });
  });

  describe("when contentItem has children (parent node)", () => {
    it("should subscribe to all children's completion status observables", () => {
      const childState1 = new ContentState();
      const childState2 = new ContentState();

      const child1: CourseContent = {
        id: "child-1",
        name: "Child 1",
        type: CourseContentItemType.SCORM,
        state: childState1,
      };

      const child2: CourseContent = {
        id: "child-2",
        name: "Child 2",
        type: CourseContentItemType.PDF,
        state: childState2,
      };

      const parentState = new ContentState();
      const parentContentItem: CourseContent = {
        id: "parent-content",
        name: "Parent Content",
        type: CourseContentItemType.SUBMODULE,
        state: parentState,
        children: [child1, child2],
      };

      // Mock the initial calculation
      vi.mocked(calculateContentCompletionStatus).mockReturnValue(CompletionStatus.NotStarted);

      const { result } = renderHook(() => useCompletionStatus(parentContentItem));

      expect(result.current).toBe(CompletionStatus.NotStarted);

      // Mock the recalculation when a child changes
      vi.mocked(calculateContentCompletionStatus).mockReturnValue(CompletionStatus.Started);

      // Change a child's status
      act(() => {
        childState1.completionStatus = CompletionStatus.Started;
      });

      expect(calculateContentCompletionStatus).toHaveBeenCalledWith(parentContentItem);
      expect(parentState.completionStatus).toBe(CompletionStatus.Started);
      expect(result.current).toBe(CompletionStatus.Started);
    });

    it("should update parent status when any child status changes", () => {
      const childState1 = new ContentState();
      const childState2 = new ContentState();

      const child1: CourseContent = {
        id: "child-1",
        name: "Child 1",
        type: CourseContentItemType.SCORM,
        state: childState1,
      };

      const child2: CourseContent = {
        id: "child-2",
        name: "Child 2",
        type: CourseContentItemType.PDF,
        state: childState2,
      };

      const parentState = new ContentState();
      const parentContentItem: CourseContent = {
        id: "parent-content",
        name: "Parent Content",
        type: CourseContentItemType.SUBMODULE,
        state: parentState,
        children: [child1, child2],
      };

      vi.mocked(calculateContentCompletionStatus).mockReturnValue(CompletionStatus.Started);

      const { result } = renderHook(() => useCompletionStatus(parentContentItem));

      // Verify that the hook responds to child status changes
      const initialStatus = result.current;

      // Change first child
      act(() => {
        childState1.completionStatus = CompletionStatus.Started;
      });

      // Verify that calculateContentCompletionStatus was called with the parent
      expect(calculateContentCompletionStatus).toHaveBeenCalledWith(parentContentItem);

      // Verify that the parent state was updated
      expect(parentState.completionStatus).toBe(CompletionStatus.Started);
      expect(result.current).toBe(CompletionStatus.Started);
    });

    it("should unsubscribe from all children observables on unmount", () => {
      const childState1 = new ContentState();
      const childState2 = new ContentState();

      const child1: CourseContent = {
        id: "child-1",
        name: "Child 1",
        type: CourseContentItemType.SCORM,
        state: childState1,
      };

      const child2: CourseContent = {
        id: "child-2",
        name: "Child 2",
        type: CourseContentItemType.PDF,
        state: childState2,
      };

      const parentContentItem: CourseContent = {
        id: "parent-content",
        name: "Parent Content",
        type: CourseContentItemType.SUBMODULE,
        state: new ContentState(),
        children: [child1, child2],
      };

      vi.mocked(calculateContentCompletionStatus).mockReturnValue(CompletionStatus.NotStarted);

      const { unmount } = renderHook(() => useCompletionStatus(parentContentItem));

      // Change child status to verify subscriptions are working
      act(() => {
        childState1.completionStatus = CompletionStatus.Started;
      });

      // Unmount should not cause any errors (subscription cleanup)
      expect(() => unmount()).not.toThrow();
    });

    it("should handle empty children array", () => {
      const parentContentItem: CourseContent = {
        id: "parent-content",
        name: "Parent Content",
        type: CourseContentItemType.SUBMODULE,
        state: new ContentState(),
        children: [],
      };

      vi.mocked(calculateContentCompletionStatus).mockReturnValue(CompletionStatus.NotStarted);

      const { result } = renderHook(() => useCompletionStatus(parentContentItem));

      expect(result.current).toBe(CompletionStatus.NotStarted);
      expect(calculateContentCompletionStatus).toHaveBeenCalledWith(parentContentItem);
    });
  });

  describe("when contentItem changes", () => {
    it("should update status when contentItem changes from undefined to defined", () => {
      const { result, rerender } = renderHook(
        ({ contentItem }: { contentItem?: CourseContent }) => useCompletionStatus(contentItem),
        { initialProps: { contentItem: undefined } as { contentItem?: CourseContent } },
      );

      expect(result.current).toBe(CompletionStatus.Unknown);

      const newContentItem: CourseContent = {
        id: "new-content",
        name: "New Content",
        type: CourseContentItemType.SCORM,
        state: new ContentState(),
      };

      vi.mocked(calculateContentCompletionStatus).mockReturnValue(CompletionStatus.Started);

      rerender({ contentItem: newContentItem });

      expect(result.current).toBe(CompletionStatus.Started);
      expect(calculateContentCompletionStatus).toHaveBeenCalledWith(newContentItem);
    });

    it("should update status when contentItem changes from defined to undefined", () => {
      const initialContentItem: CourseContent = {
        id: "initial-content",
        name: "Initial Content",
        type: CourseContentItemType.SCORM,
        state: new ContentState(),
      };

      vi.mocked(calculateContentCompletionStatus).mockReturnValue(CompletionStatus.Started);

      const { result, rerender } = renderHook(
        ({ contentItem }: { contentItem?: CourseContent }) => useCompletionStatus(contentItem),
        { initialProps: { contentItem: initialContentItem } as { contentItem?: CourseContent } },
      );

      expect(result.current).toBe(CompletionStatus.Started);

      rerender({ contentItem: undefined });

      expect(result.current).toBe(CompletionStatus.Unknown);
    });

    it("should update subscriptions when contentItem changes", () => {
      const state1 = new ContentState();
      const contentItem1: CourseContent = {
        id: "content-1",
        name: "Content 1",
        type: CourseContentItemType.SCORM,
        state: state1,
      };

      const state2 = new ContentState();
      const contentItem2: CourseContent = {
        id: "content-2",
        name: "Content 2",
        type: CourseContentItemType.PDF,
        state: state2,
      };

      vi.mocked(calculateContentCompletionStatus).mockReturnValue(CompletionStatus.NotStarted);

      const { result, rerender } = renderHook(
        ({ contentItem }: { contentItem?: CourseContent }) => useCompletionStatus(contentItem),
        { initialProps: { contentItem: contentItem1 } },
      );

      expect(result.current).toBe(CompletionStatus.NotStarted);

      // Change to different content item
      rerender({ contentItem: contentItem2 });

      expect(result.current).toBe(CompletionStatus.NotStarted);

      // Verify that changing the new content item's status works
      act(() => {
        state2.completionStatus = CompletionStatus.Started;
      });

      expect(result.current).toBe(CompletionStatus.Started);
    });
  });

  describe("edge cases", () => {
    it("should handle contentItem with null children", () => {
      const contentItem: CourseContent = {
        id: "test-content",
        name: "Test Content",
        type: CourseContentItemType.SCORM,
        state: new ContentState(),
        children: undefined,
      };

      vi.mocked(calculateContentCompletionStatus).mockReturnValue(CompletionStatus.NotStarted);

      const { result } = renderHook(() => useCompletionStatus(contentItem));

      expect(result.current).toBe(CompletionStatus.NotStarted);
    });

    it("should handle all completion status values", () => {
      const mockState = new ContentState();
      const contentItem: CourseContent = {
        id: "test-content",
        name: "Test Content",
        type: CourseContentItemType.SCORM,
        state: mockState,
      };

      vi.mocked(calculateContentCompletionStatus).mockReturnValue(CompletionStatus.Unknown);

      const { result } = renderHook(() => useCompletionStatus(contentItem));

      // Test all possible status transitions
      const statuses = [
        CompletionStatus.Unknown,
        CompletionStatus.NotStarted,
        CompletionStatus.Started,
        CompletionStatus.Completed,
      ];

      statuses.forEach((status) => {
        act(() => {
          mockState.completionStatus = status;
        });
        expect(result.current).toBe(status);
      });
    });
  });
});
