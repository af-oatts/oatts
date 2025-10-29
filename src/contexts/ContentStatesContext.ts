import { CompletionStatus, ContentState } from '@/core/model/OattsModel';
import { createContext } from 'react';

type ContentStatesContextType = {
  states: Map<string, ContentState>;
  updateContentStatus: (contentId: string, status: CompletionStatus) => void;
  getContentState: (contentId: string, noDbFetch?: boolean) => Promise<ContentState | undefined>;
  setContentState: (contentId: string, state: ContentState) => void;
};

export const ContentStatesContext = createContext<ContentStatesContextType | null>(null);