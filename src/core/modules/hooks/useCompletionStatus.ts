import { CompletionStatus, ContentItem } from "@/core/model/OattsModel";
import { useEffect, useState } from "react";
import { CalculateContentCompletionStatus } from "../ModuleUtils";

export default function useCompletionStatus(contentItem?: ContentItem) {
  const [status, setStatus] = useState<CompletionStatus>(
    contentItem !== undefined ? CalculateContentCompletionStatus(contentItem) : CompletionStatus.Unknown,
  );
  useEffect(() => {
    if (contentItem === undefined) {
      return;
    }

    if (!Array.isArray(contentItem.subContents)) {
      const observer = contentItem.state.completionStatusObservable.subscribe((status) => {
        setStatus(status);
      });

      return () => observer.unsubscribe();
    } else {
      const observers =
        contentItem.subContents?.map((s) =>
          s.state.completionStatusObservable.subscribe((_) => {
            contentItem.state.completionStatus = CalculateContentCompletionStatus(contentItem);
            setStatus(contentItem.state.completionStatus);
          }),
        ) ?? [];

      return () => observers.forEach((o) => o.unsubscribe());
    }
  });

  return status;
}
