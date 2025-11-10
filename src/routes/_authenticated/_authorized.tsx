import User, { UserStatusFlag } from "@/core/model/UserModel";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/_authorized")({
  component: Layout,
  beforeLoad: ({ context }) => {
    if (context.authentication.user === undefined || !IsUserAuthorized(context.authentication.user)) {
      throw redirect({ to: "/onboarding/intro" });
    }
  },
});

const authFlags: UserStatusFlag[] = [UserStatusFlag.Onboarded, UserStatusFlag.PreQuizzed];

function IsUserAuthorized(user: User): boolean {
  return authFlags.every((flag) => user.statusFlags.includes(flag));
}

export default function Layout() {
  return (
    <>
      <Outlet />
    </>
  );
}
