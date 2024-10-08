import { createContext, ReactNode } from 'react';

type OverlayContextType = {
  content: ReactNode | null;
  setContent: (component: ReactNode) => void;
};

export const OverlayContext = createContext<OverlayContextType | null>(null);


