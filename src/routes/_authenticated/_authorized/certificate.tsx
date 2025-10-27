import { BigLoadingScreen } from "@/components/common/BigLoadingScreen";
import { CourseCompletionView } from "@/components/module/CourseCompletionView";
import { loadRequiredAndOptionalCourses } from "@/core/modules/ModuleLoader";
import { checkIfRequirementsAreComplete } from "@/core/modules/ModuleUtils";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/_authenticated/_authorized/certificate")({
  component: CertificatePage,
  pendingComponent: () => <BigLoadingScreen name="modules"/>,
  loader: loadRequiredAndOptionalCourses,
  gcTime: 0,
  // Only reload the route when the user navigates to it or when deps change
  shouldReload: false,
});

function CertificatePage() {
  const { required } = Route.useLoaderData();
  const navigate = useNavigate();

  useEffect(() => {
    const isComplete = checkIfRequirementsAreComplete(required);
    if (!isComplete) navigate({ to: "/dashboard" });
  }, [required]);

  return <CourseCompletionView />;
}
