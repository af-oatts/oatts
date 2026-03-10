
/*
 * Copyright © 2026 DCS Corporation, 6909 Metro Park Drive Suite 500, Alexandria, VA 22310.
 * See the LICENSE file for rights & permissions.
 */

import { deleteUserScorm } from "@/core/database/Content";
import { CompletionStatus, Course } from "@/core/model/OattsModel";
import { useUser } from "@/contexts/hooks/useUser";
import { useCallback } from "react";
import { useSetStatus } from "./useStatus";
import { FlattenCourse } from "@/utils/Flattener";

export function useResetCourse() {
  const { user } = useUser();
  const setStatus = useSetStatus();

  if (!user) throw new Error("User should be defined");

  return useCallback(async (course: Course,) => {
    const contents = FlattenCourse(course);
    for (let content of contents) {
      setStatus(content.id, { completionStatus: CompletionStatus.NotStarted });
      deleteUserScorm(user, content.id);
    };
  }, [setStatus, user]);
}
