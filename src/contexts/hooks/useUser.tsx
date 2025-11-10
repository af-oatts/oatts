import { useRouteContext } from "@tanstack/react-router";

export function useUser() {
  return useRouteContext({
    from: "/_authenticated",
    select: (ctx) => ({ user: ctx.authentication.user }),
  });
}
