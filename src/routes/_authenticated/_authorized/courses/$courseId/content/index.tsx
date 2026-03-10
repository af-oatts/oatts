
/*
 * Copyright © 2026 DCS Corporation, 6909 Metro Park Drive Suite 500, Alexandria, VA 22310.
 * See the LICENSE file for rights & permissions.
 */

import ErrorPage from "@/components/error-page";
import { useStatuses } from "@/contexts/hooks/useStatus";
import { useCourse } from "@/contexts/providers/CourseContextProvider";
import { CompletionStatus, CourseContent } from "@/core/model/OattsModel";
import { Status } from "@/core/model/Status";
import { FlattenContents } from "@/utils/Flattener";
import { createFileRoute, Navigate, useParams } from "@tanstack/react-router";
import { useMemo } from "react";

const FILE_ROUTE = `/_authenticated/_authorized/courses/$courseId/content/`;
export const Route = createFileRoute(FILE_ROUTE)({
  component: RouteComponent,
});

function RouteComponent() {
  const { courseId } = useParams({ from: FILE_ROUTE });
  const [course, isLoading] = useCourse(courseId);
  const allContents = course ? FlattenContents(course?.contents) : [];
  const statuses = useStatuses(allContents.map(c => c.id)); // Will be undefined if course is undefined.
  const contentId = useMemo(() => statuses ? determineNext(allContents, statuses) : undefined, [statuses]);

  if (contentId == undefined || isLoading) {
    return <></>
  }
  if (contentId == null) {
    return <ErrorPage details="Could not find viable content."></ErrorPage>
  }

  return <Navigate to="/courses/$courseId/content/$contentId" params={{ courseId, contentId }} />;
}


function determineNext(allContent: CourseContent[], statuses: Map<string, Status | undefined>): string | null {
  for (let content of allContent) {
    if (content.children) {
      continue; // Content with children have no state. 
    }
    const status = statuses.get(content.id);
    if (!status || status.completionStatus !== CompletionStatus.Completed) {
      return content.id;
    }
  }

  return allContent.find(f => !f.children)?.id ?? null;
}