import { createFileRoute, useRouteContext } from "@tanstack/react-router";
import { loadRequiredAndOptionalModules } from "@/core/modules/ModuleLoader";
import { ModulesView } from "@/components/dashboard/ModulesView";
import { BigLoadingScreen } from "@/components/common/BigLoadingScreen";
import { checkIfRequirementsAreComplete } from "@/core/modules/ModuleUtils";
import { UserStatusFlag } from "@/core/model/UserModel";
import PostQuizPage from "@/components/quiz/PostQuiz";


export const Route = createFileRoute("/_authenticated/_authorized/dashboard")({
  component: DashboardPage,
  pendingComponent: () => <BigLoadingScreen name="modules"/>,
  loader: loadRequiredAndOptionalModules,
  gcTime: 0,
  // Only reload the route when the user navigates to it or when deps change
  shouldReload: false,
});

export function useUser() {
  return useRouteContext({
    from: "/_authenticated",
    select: (ctx) => ({ user: ctx.authentication.user }),
  });
}

export default function DashboardPage() {
  const { required, optional } = Route.useLoaderData();
  const context = Route.useRouteContext();
  const { user } = useUser();
  const isEachRequirementComplete = checkIfRequirementsAreComplete(required);
  const isPostQuizComplete = !!user?.statusFlags.find((flag) => flag === UserStatusFlag.PostQuizzed);

  if (isEachRequirementComplete && !isPostQuizComplete) {
    return <PostQuizPage onNext={() => {}} />;
  }

  return <ModulesView {...{ required, optional, }} mayCollectData={context.config.allowDataCollection?? false} />;
}
