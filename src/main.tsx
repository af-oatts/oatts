
/*
 * Copyright © 2026 DCS Corporation, 6909 Metro Park Drive Suite 500, Alexandria, VA 22310.
 * See the LICENSE file for rights & permissions.
 */

import ReactDOM from "react-dom/client";
import React from "react";
import App from "./App";
import { UserProvider } from "./contexts/providers/UserProvider";
import "./i18n/i18n";
import { OverlayProvider } from "./contexts/providers/OverlayProvider";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <UserProvider>
      <OverlayProvider>
        <App />
      </OverlayProvider>
    </UserProvider>
  </React.StrictMode>,
);
