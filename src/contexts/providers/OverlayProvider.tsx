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