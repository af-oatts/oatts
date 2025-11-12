import { CourseContent, ContentState } from "@/core/model/OattsModel";
import { getCourseContentState } from "@/core/modules/getCourseContentState";
import { useUser } from "@/contexts/hooks/useUser";
import { useState, useEffect } from "react";

export function useCourseContentState(content: CourseContent | undefined): [ContentState | undefined, boolean] {
  const { user } = useUser();
  const [state, setState] = useState<ContentState>();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user || !content) return;

    getCourseContentState(user, content)
      .then((next) => setState(next))
      .finally(() => setIsLoading(false));
  }, [content, user]);

  return [state, isLoading];
}
