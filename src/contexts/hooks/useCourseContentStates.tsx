import { CourseContent } from "@/core/model/OattsModel";
import { getCourseContentState } from "@/core/modules/getCourseContentState";
import { useUser } from "@/contexts/hooks/useUser";
import { useContext, useState, useEffect } from "react";
import { ContentStatesContext } from "../ContentStatesContext";
import { ContentStateMap } from "../models/ContentStateMap";

export function useCourseContentStates(content: CourseContent[] | undefined): [ContentStateMap, boolean] {
  const { user } = useUser();
  const { states, setStates } = useContext(ContentStatesContext);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user || !content) return;

    Promise.all(content.map((x) => getCourseContentState(user, x)))
      .then((result) => {
        const next = result.reduce((acc, x) => Object.assign(acc, { [x.contentID]: x }), {} as ContentStateMap);
        setStates(next);
      })
      .finally(() => setIsLoading(false));
  }, []);

  return [states, isLoading];
}
