import { ContentState } from "@/core/model/OattsModel";

import { createContext } from "react";

import { ContentStateMap } from "@/contexts/models/ContentStateMap";

type ContentStatesContextType = {
  states: ContentStateMap;
  setStates: (next: ContentStateMap) => void;
  setState: (contentId: string, state: ContentState) => void;
};

export const ContentStatesContext = createContext<ContentStatesContextType>({
  states: {},
  setStates: () => {},
  setState: () => {},
});
