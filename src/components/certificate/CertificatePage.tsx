import { CourseCompletionView } from "@/components/module/CourseCompletionView";
import { useRequiredAndOptionalCourses } from "@/contexts/hooks/useRequiredAndOptionalCourses";
import { useIsComplete } from "@/contexts/hooks/useStatus";

import { Navigate } from "@tanstack/react-router";

export function CertificatePage() {
  const { required } = useRequiredAndOptionalCourses();

  const isComplete = useIsComplete(required);

  if (!isComplete) return <Navigate to="/dashboard" />;

  return <CourseCompletionView />;
}
