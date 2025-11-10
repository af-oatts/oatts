import { resetUserAssessment } from "@/core/database/Content";
import { Course } from "@/core/model/OattsModel";
import { FlattenContents } from "@/core/modules/ModuleUtils";
import { useUser } from "@/contexts/hooks/useUser";
import { useContext } from "react";
import { ContentStatesContext } from "../ContentStatesContext";

export function useResetCourse() {
  const context = useContext(ContentStatesContext);
  const { user } = useUser();
  if (!user) throw new Error("User should be defined");
  if (!context) throw new Error("useResetCourse must be used within ContentStatesProvider");
  return async (course: Course, noDbWrite: boolean = false) => {
    let flatCourse = FlattenContents(course.contents);
    const next = { ...context.states };
    for (let content of flatCourse) {
      delete next[content.id];

      if (!noDbWrite) {
        await resetUserAssessment(user, content.id);
      }
    }
    context.setStates(next);
  };
}
