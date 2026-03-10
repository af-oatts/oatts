
/*
 * Copyright © 2026 DCS Corporation, 6909 Metro Park Drive Suite 500, Alexandria, VA 22310.
 * See the LICENSE file for rights & permissions.
 */

import { useRouteContext } from "@tanstack/react-router";

export function useUser() {
  return useRouteContext({
    from: "/_authenticated",
    select: (ctx) => ({ user: ctx.authentication.user }),
  });
}
