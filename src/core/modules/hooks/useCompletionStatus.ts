import { CompletionStatus, CourseContent } from "@/core/model/OattsModel";
import { useEffect, useState } from "react";
import { calculateContentCompletionStatus } from "../ModuleUtils";

export default function useCompletionStatus(contentItem?: CourseContent) {
  const [status, setStatus] = useState<CompletionStatus>(
    contentItem !== undefined ? calculateContentCompletionStatus(contentItem) : CompletionStatus.Unknown,
  );
  useEffect(() => {
    if (contentItem === undefined) {
      setStatus(CompletionStatus.Unknown);
      return;
    }

    // Update status when contentItem changes
    setStatus(calculateContentCompletionStatus(contentItem));

    if (!Array.isArray(contentItem.children)) {
      const observer = contentItem.state.completionStatusObservable.subscribe((status) => {
        setStatus(status);
      });

      return () => observer.unsubscribe();
    } else {
      const observers =
        contentItem.children?.map((s) =>
          s.state.completionStatusObservable.subscribe((_) => {
            contentItem.state.completionStatus = calculateContentCompletionStatus(contentItem);
            setStatus(contentItem.state.completionStatus);
          }),
        ) ?? [];

      return () => observers.forEach((o) => o.unsubscribe());
    }
  }, [contentItem]);

  return status;
}
