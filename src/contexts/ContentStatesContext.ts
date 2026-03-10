
/*
 * Copyright © 2026 DCS Corporation, 6909 Metro Park Drive Suite 500, Alexandria, VA 22310.
 * See the LICENSE file for rights & permissions.
 */

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
