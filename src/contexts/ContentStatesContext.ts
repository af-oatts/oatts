import { CompletionStatus, ContentState } from "@/core/model/OattsModel";
import User from "@/core/model/UserModel";
import { createContext } from "react";
import { ContentLoadingState } from "./providers/ContentStatesProvider";

type ContentStatesContextType = {
  _user: User | undefined;
  states: Map<string, ContentState>;
  loading: Map<string, ContentLoadingState>;
  updateContentStatus: (contentId: string, status: CompletionStatus) => void;
  ensureContentStateLoaded: (contentId: string) => void;
  setContentState: (contentId: string, state: ContentState) => void;
  removeContentState: (contentId: string) => void;
};

export const ContentStatesContext = createContext<ContentStatesContextType | null>(null);
