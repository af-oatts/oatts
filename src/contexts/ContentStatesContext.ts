import { CompletionStatus, ContentState } from '@/core/model/OattsModel';
import User from '@/core/model/UserModel';
import { createContext } from 'react';

type ContentStatesContextType = {
  _user: User | undefined;
  states: Map<string, ContentState>;
  loadingIds: Set<string>;
  updateContentStatus: (contentId: string, status: CompletionStatus) => void;
  ensureContentStateLoaded: (contentId: string) => void;
  setContentState: (contentId: string, state: ContentState) => void;
  removeContentState: (contentId: string) => void;
};

export const ContentStatesContext = createContext<ContentStatesContextType | null>(null);