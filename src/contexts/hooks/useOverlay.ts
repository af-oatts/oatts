
/*
 * Copyright © 2026 DCS Corporation, 6909 Metro Park Drive Suite 500, Alexandria, VA 22310.
 * See the LICENSE file for rights & permissions.
 */

import { ReactNode, useContext } from "react";
import { OverlayContext } from "../OverlayContext";

export const useSetOverlay = () => {
  const ctx = useContext(OverlayContext);
  if (!ctx) throw new Error("useSetOverlay must be used inside OverlayProvider");
  return ctx.setContent;
};

export const useOverlayContent : () => ReactNode | null = () => {
  const ctx = useContext(OverlayContext);
  if (!ctx) throw new Error("useOverlayContent must be used inside OverlayProvider");
  return ctx.content;
};
