import { useContext, useMemo } from "react";
import { ContentStatesContext } from "../ContentStatesContext";
import { CompletionStatus, CourseContent } from "@/core/model/OattsModel";

// Hook for accessing a SINGLE content item (prevents unnecessary re-renders)
export function useCourseContentState(contentId: string) {
  const context = useContext(ContentStatesContext);
  if (!context) throw new Error('useCourseContentState must be used within ContentStatesProvider');
  
  // Only re-render when THIS specific content changes
  const content = useMemo(() => 
    context.getContentState(contentId, true), 
    [context.states, contentId] // Will only update when contents array changes
  );
  
  return {
    content,
    updateStatus: (status: CompletionStatus) => context.updateContentStatus(contentId, status)
  };
}

// Hook for accessing multiple content items by IDs
export function useCourseContentStates(contentIds: string[]) {
  const context = useContext(ContentStatesContext);
  if (!context) throw new Error('useMultipleCourseContents must be used within ContentStatesProvider');
  
  const contents = useMemo(() =>
    contentIds.filter(v => contentIds.includes(v)),
    [context.states, contentIds.join(',')] // Only update when contents or IDs change
  );
  
  return contents;
}


export function useAllCourseContentStates() {
  const context = useContext(ContentStatesContext);
  if (!context) throw new Error('useAllCourseContents must be used within ContentStatesProvider');
  return context.states;
}