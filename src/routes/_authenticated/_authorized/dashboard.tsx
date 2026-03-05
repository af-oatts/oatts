import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useRequiredAndOptionalCourses } from "@/contexts/hooks/useRequiredAndOptionalCourses";
import { CoursesView } from "@/components/dashboard/CoursesView";
import { BigLoadingScreen } from "@/components/common/BigLoadingScreen";
import { useUser } from "@/contexts/hooks/useUser";
import { UserStatusFlag } from "@/core/model/UserModel";
import { useCompletion } from "@/contexts/hooks/useStatus";

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
  const isEachRequirementComplete = useCompletion(required);

  const isPostQuizComplete = !!user?.statusFlags.find((flag) => flag === UserStatusFlag.PostQuizzed);

  if (isEachRequirementComplete && !isPostQuizComplete) {
    console.log("REDIRECTING TO POSTQUIZ");
    
    return <Navigate to={"/postquiz"} />;
  }

  return (
    <CoursesView required={required} optional={optional} mayCollectData={context.config.allowDataCollection ?? false} />
  );
}
