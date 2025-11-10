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
