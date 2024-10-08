import { ContentItem, CompletionStatus } from "@/core/model/OattsModel";
import { useState, useEffect } from "react";
import { calculateMultiContentCompletionStatus, ReduceCompletionStatus } from "../ModuleUtils";


export function useMultiCompletionStatus(contentItems?: ContentItem[]) {
  const [status, setStatus] = useState<CompletionStatus>(
    contentItems !== undefined ? calculateMultiContentCompletionStatus(contentItems) : CompletionStatus.Unknown
  );
  useEffect(() => {
    if (contentItems === undefined) {
      return;
    }

    const observers = contentItems.map((content) => content.state.completionStatusObservable.subscribe((_) => {
      const statuses = contentItems.map(c => c.state.completionStatus);
      setStatus(ReduceCompletionStatus(statuses));
    })
    ) ?? [];

    return () => observers.forEach((o) => o.unsubscribe());
  });

  return status;
}