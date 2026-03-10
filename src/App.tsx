
/*
 * Copyright © 2026 DCS Corporation, 6909 Metro Park Drive Suite 500, Alexandria, VA 22310.
 * See the LICENSE file for rights & permissions.
 */

import "@fontsource/inter";
import "./theme/App.css";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import ErrorPage from "./components/error-page";
import { useAuth } from "./contexts/hooks/useAuth";
import CoursesContext from "./core/modules/ContentContext";

const router = createRouter({ routeTree: routeTree, defaultNotFoundComponent: () => <ErrorPage/>, context: undefined! });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  const auth = useAuth();
  return <RouterProvider router={router} context={{ authentication: auth, courses: new CoursesContext() }} />;
}
