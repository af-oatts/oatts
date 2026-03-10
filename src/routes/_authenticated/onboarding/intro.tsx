
/*
 * Copyright © 2026 DCS Corporation, 6909 Metro Park Drive Suite 500, Alexandria, VA 22310.
 * See the LICENSE file for rights & permissions.
 */

import IntroPage from "@/components/onboarding/IntroPage";
import { createFileRoute, useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/onboarding/intro")({
  component: RouteComponent,
});

function RouteComponent() {
  let navigate = useNavigate();

  return <IntroPage onNext={() => navigate({ to: "/onboarding/interests" })} />;
}
