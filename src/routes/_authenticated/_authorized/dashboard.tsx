import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useRequiredAndOptionalCourses } from "@/contexts/hooks/useRequiredAndOptionalCourses";
import { CoursesView } from "@/components/dashboard/CoursesView";
import { BigLoadingScreen } from "@/components/common/BigLoadingScreen";
import { checkIfRequirementsAreComplete } from "@/core/modules/ModuleUtils";
import { useCourseContentStates } from "@/contexts/hooks/useCourseContentStates";
import { useUser } from "@/contexts/hooks/useUser";
import { UserStatusFlag } from "@/core/model/UserModel";

export const Route = createFileRoute("/_authenticated/_authorized/dashboard")({
  component: DashboardPage,
  pendingComponent: () => <BigLoadingScreen name="modules" />,
  gcTime: 0,
  // Only reload the route when the user navigates to it or when deps change
  shouldReload: false,
});

export default function DashboardPage() {
  const { required, optional } = useRequiredAndOptionalCourses();
  const context = Route.useRouteContext();
  const { user } = useUser();
  const [states, isLoading] = useCourseContentStates(required.flatMap((x) => x.contents));

  if (isLoading) return <BigLoadingScreen name="modules"></BigLoadingScreen>;

  const isEachRequirementComplete = checkIfRequirementsAreComplete(required, states);
  const isPostQuizComplete = !!user?.statusFlags.find((flag) => flag === UserStatusFlag.PostQuizzed);

  if (!isLoading && isEachRequirementComplete && !isPostQuizComplete) {
    return <Navigate to={"/postquiz"} />;
  }

  return (
    <CoursesView required={required} optional={optional} mayCollectData={context.config.allowDataCollection ?? false} />
  );
}
