import { BigLoadingScreen } from "@/components/common/BigLoadingScreen";
import { CourseCompletionView } from "@/components/module/CourseCompletionView";
import { useCourseContentStates } from "@/contexts/hooks/useCourseContentStates";
import { useRequiredAndOptionalCourses } from "@/contexts/hooks/useRequiredAndOptionalCourses";

import { checkIfRequirementsAreComplete } from "@/core/modules/ModuleUtils";
import { Navigate } from "@tanstack/react-router";

export function CertificatePage() {
  const { required } = useRequiredAndOptionalCourses();
  const [states, isLoading] = useCourseContentStates(required.flatMap((x) => x.contents));

  const isComplete = checkIfRequirementsAreComplete(required, states);

  if (isLoading) return <BigLoadingScreen name="certificate" />;

  if (!isComplete) return <Navigate to="/dashboard" />;

  return <CourseCompletionView />;
}
