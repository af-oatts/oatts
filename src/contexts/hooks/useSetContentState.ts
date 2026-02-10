import { externalizeContentState, saveContentStateType } from "@/core/database/Content";
import { ContentState } from "@/core/model/OattsModel";
import { useUser } from "@/contexts/hooks/useUser";
import { useCallback, useContext } from "react";
import { ContentStatesContext } from "../ContentStatesContext";

export function useSetContentState() {
  const context = useContext(ContentStatesContext);
  const { user } = useUser();

  if (!context) throw new Error("useSetContentState must be used within ContentStatesProvider");

  return useCallback(
    async (contentId: string, state: ContentState, noDbWrite: boolean = false) => {
      context?.setState(contentId, state);
      if (noDbWrite) {
        return;
      }
      if (!user) {
        console.error("Tried to update " + contentId + "'s score for user, but user is undefined!");
        return;
      }
      let externalizedState = externalizeContentState(state);
      await saveContentStateType(user, contentId, externalizedState);
    },
    [context, user],
  );
}
