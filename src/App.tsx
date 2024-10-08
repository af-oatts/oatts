import "@fontsource/inter";
import "./theme/App.css";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import ErrorPage from "./components/error-page";
import { useAuth } from "./contexts/hooks/useAuth";
import ModuleContext from "./core/modules/ModuleContext";

const router = createRouter({ routeTree: routeTree, defaultNotFoundComponent: ErrorPage, context: undefined! });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  const auth = useAuth();
  return <RouterProvider router={router} context={{ authentication: auth, modules: new ModuleContext() }} />;
}
