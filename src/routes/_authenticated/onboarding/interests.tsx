
/*
 * Copyright © 2026 DCS Corporation, 6909 Metro Park Drive Suite 500, Alexandria, VA 22310.
 * See the LICENSE file for rights & permissions.
 */

import RolePage from "@/components/onboarding/RolePage";
import { createFileRoute, useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/onboarding/interests")({
  component: RouteComponent,
});

function RouteComponent() {
  let navigate = useNavigate();

  return (
    <RolePage
      onNext={() => navigate({ to: "/onboarding/preQuizIntro" })}
      onPrevious={() => navigate({ to: "/onboarding/intro" })}
    />
  );
}
