
/*
 * Copyright © 2026 DCS Corporation, 6909 Metro Park Drive Suite 500, Alexandria, VA 22310.
 * See the LICENSE file for rights & permissions.
 */

import { CertificatePage } from "@/components/certificate/CertificatePage";
import { BigLoadingScreen } from "@/components/common/BigLoadingScreen";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/_authorized/certificate")({
  component: CertificatePage,
  pendingComponent: () => <BigLoadingScreen name="certificate" />,
  gcTime: 0,
  // Only reload the route when the user navigates to it or when deps change
  shouldReload: false,
});
