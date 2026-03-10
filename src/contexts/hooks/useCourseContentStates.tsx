
/*
 * Copyright © 2026 DCS Corporation, 6909 Metro Park Drive Suite 500, Alexandria, VA 22310.
 * See the LICENSE file for rights & permissions.
 */

import { CourseContent } from "@/core/model/OattsModel";
import { getCourseContentState } from "@/core/modules/getCourseContentState";
import { useUser } from "@/contexts/hooks/useUser";
import { useContext, useState, useEffect } from "react";
import { ContentStatesContext } from "../ContentStatesContext";
import { ContentStateMap } from "../models/ContentStateMap";

export function useCourseContentStates(contents: CourseContent[] | undefined): [ContentStateMap, boolean] {
  const { user } = useUser();
  const { states, setStates } = useContext(ContentStatesContext);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user || !contents) return;
    const flatten = (contents : CourseContent[]) => {
      let flatContents : CourseContent[] = []
      contents.forEach(c => flatContents = c.children? [...flatContents, c, ...flatten(c.children)] : [...flatContents, c]);
      return flatContents;
    }

    const flatContents = flatten(contents);

      
    Promise.all(flatContents.map((x) => getCourseContentState(user, x)))
      .then((result) => {
        const next = result.reduce((acc, x) => Object.assign(acc, { [x.contentID]: x }), {} as ContentStateMap);
        setStates(next);
      })
      .finally(() => setIsLoading(false));
  }, []);

  return [states, isLoading];
}
