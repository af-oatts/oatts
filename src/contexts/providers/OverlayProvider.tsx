
/*
 * Copyright © 2026 DCS Corporation, 6909 Metro Park Drive Suite 500, Alexandria, VA 22310.
 * See the LICENSE file for rights & permissions.
 */

import { ReactNode, useState } from "react";
import { OverlayContext } from "../OverlayContext";

export const OverlayProvider = ({
  children,
  defaultContent,
}: {
  children: ReactNode;
  defaultContent?: ReactNode;
}) => {
  const [content, setContent] = useState<ReactNode>(defaultContent ?? null);

  return (
    <OverlayContext.Provider value={{ content, setContent }}>
      {children}
    </OverlayContext.Provider>
  );
};