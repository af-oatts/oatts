
/*
 * Copyright © 2026 DCS Corporation, 6909 Metro Park Drive Suite 500, Alexandria, VA 22310.
 * See the LICENSE file for rights & permissions.
 */

import { createContext, ReactNode } from 'react';

type OverlayContextType = {
  content: ReactNode | null;
  setContent: (component: ReactNode) => void;
};

export const OverlayContext = createContext<OverlayContextType | null>(null);


