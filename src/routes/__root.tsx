import { UserContextType } from "@/contexts/UserContext";
import CoursesContext from "@/core/modules/ContentContext";
import { IScormApi } from "@/core/scorm/ScormApi";
import { CssBaseline } from "@mui/material";
import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import AppTheme from "@/theme/AppTheme";
import LoadConfig from "@/core/utils/ConfigLoader";
import { OattsManifest } from "@/core/model/OattsModel";
import { ManifestContextProvider } from "@/contexts/providers/CourseContextProvider";

type RouterContext = {
  authentication: UserContextType;
  courses: CoursesContext;
  manifest: OattsManifest;
};

declare global {
  interface Window {
    API_1484_11: IScormApi;
  }
}

const routeWithCtx = createRootRouteWithContext<RouterContext>();
export const Route = routeWithCtx({
  component: Root,
  beforeLoad: async () => {
    let config = await LoadConfig();
    // let config;
    if (config === undefined) {
      config = {
        courses: [],
        roles: [],
        prequizzes: [],
        postquizzes: [],
      };
    }
    return { config };
  },
});

function Root() {
  return (
    <AppTheme>
      <ManifestContextProvider>
        <CssBaseline />
        <Outlet />
      </ManifestContextProvider>
    </AppTheme>
  );
}
