
/*
 * Copyright © 2026 DCS Corporation, 6909 Metro Park Drive Suite 500, Alexandria, VA 22310.
 * See the LICENSE file for rights & permissions.
 */

import { GetUsers } from "@/core/authentication/Authenticator";
import UserSelectionPage from "@/components/authentication/UserSelectionPage";
import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/_authentication/login")({
  component: LoginPage,
  pendingComponent: LoginLoading,
  loader: async () => {
    const users = await GetUsers();
    return users;
  },
  gcTime: 0,
  // Only reload the route when the user navigates to it or when deps change
  shouldReload: false,
});

export default function LoginPage() {
  const users = Route.useLoaderData();

  if (users.length > 0) {
    return <UserSelectionPage users={users}></UserSelectionPage>;
  }

  return <Navigate to="/register" />;
}

function LoginLoading() {
  return <h1>Loading...</h1>;
}
