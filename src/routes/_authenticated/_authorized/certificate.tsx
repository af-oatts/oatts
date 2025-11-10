import { BigLoadingScreen } from "@/components/common/BigLoadingScreen";
import { CourseCompletionView } from "@/components/module/CourseCompletionView";
import { useCourseContentStates } from "@/contexts/hooks/useCourseContentStates";
import { useRequiredAndOptionalCourses } from "@/contexts/hooks/useRequiredAndOptionalCourses";

import { checkIfRequirementsAreComplete } from "@/core/modules/ModuleUtils";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/_authenticated/_authorized/certificate")({
  component: CertificatePage,
  pendingComponent: () => <BigLoadingScreen name="modules" />,
  gcTime: 0,
  // Only reload the route when the user navigates to it or when deps change
  shouldReload: false,
});

function CertificatePage() {
  const { required } = useRequiredAndOptionalCourses();
  const [states, isLoading] = useCourseContentStates(required.flatMap((x) => x.contents));
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoading) return;
    const isComplete = checkIfRequirementsAreComplete(required, states);
    if (!isComplete) navigate({ to: "/dashboard" });
  }, [required]);

  return <CourseCompletionView />;
}
