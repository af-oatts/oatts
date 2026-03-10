
/*
 * Copyright © 2026 DCS Corporation, 6909 Metro Park Drive Suite 500, Alexandria, VA 22310.
 * See the LICENSE file for rights & permissions.
 */

import { createFileRoute, Outlet } from "@tanstack/react-router";

import { AnimatePresence } from "motion/react";

export const Route = createFileRoute("/_authenticated/onboarding")({
  component: OnboardingRoute,
});

function OnboardingRoute() {
  return (
    <AnimatePresence>
      <Outlet />
    </AnimatePresence>
  );
}
