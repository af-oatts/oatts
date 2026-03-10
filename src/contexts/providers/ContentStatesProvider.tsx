
/*
 * Copyright © 2026 DCS Corporation, 6909 Metro Park Drive Suite 500, Alexandria, VA 22310.
 * See the LICENSE file for rights & permissions.
 */

import { ContentState } from "@/core/model/OattsModel";
import React, { useState, useCallback } from "react";
import { ContentStatesContext } from "../ContentStatesContext";

import { ContentStateMap } from "@/contexts/models/ContentStateMap";

export type ContentLoadingState = "loaded" | "loading" | "unloaded";

export function ContentStatesProvider({ children }: { children: React.ReactNode }) {
  const [states, setStates] = useState<ContentStateMap>({});

  const setState = useCallback((contentID: string, state: ContentState) => {
    setStates((states) => ({ ...states, [contentID]: state }));
  }, []);

  return (
    <ContentStatesContext.Provider value={{ states, setStates, setState }}>{children}</ContentStatesContext.Provider>
  );
}
