
/*
 * Copyright © 2026 DCS Corporation, 6909 Metro Park Drive Suite 500, Alexandria, VA 22310.
 * See the LICENSE file for rights & permissions.
 */

import { useStatuses } from "@/contexts/hooks/useStatus";
import { usePrequiz } from "@/contexts/providers/CourseContextProvider";
import { CompletionStatus, CourseContent } from "@/core/model/OattsModel";
import { Status } from "@/core/model/Status";
import { FlattenContents } from "@/utils/Flattener";
import { CircularProgress } from "@mui/material";
import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useMemo } from "react";

export const Route = createFileRoute("/_authenticated/onboarding/prequiz/")({
  component: RouteComponent,
});

function RouteComponent() {
  const courses = usePrequiz();
  const allContent = useMemo(() => courses?.reduce((acc: CourseContent[], course) => [...acc, ...FlattenContents(course.contents)], []), [courses]);
  const statuses = useStatuses(allContent?.map(c => c.id) ?? []);
  const next = useMemo(() => statuses && allContent ? determineNext(allContent, statuses) : undefined, [statuses]);

  if (courses === undefined || next === undefined) {
    return <CircularProgress></CircularProgress>
  }


  if (courses === null || next === null) {
    return <Navigate to="/dashboard" />
  }

  return (
    <Navigate
      to={"/onboarding/prequiz/$contentId"}
      params={{
        contentId: next,
      }}
    />
  );
}

function determineNext(allContent: CourseContent[], statuses: Map<string, Status | undefined>): string | null {
  for(let content of allContent) {
    if(content.children) {
      continue; // Content with children have no state. 
    }
    const status = statuses.get(content.id);
    if(!status || status.completionStatus !== CompletionStatus.Completed) {
      return content.id;
    }
  }
  return null;
}
