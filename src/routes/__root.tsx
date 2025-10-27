import { UserContextType } from "@/contexts/UserContext";
import CoursesContext from "@/core/modules/ContentContext";
import { IScormApi } from "@/core/scorm/ScormApi";
import { CssBaseline } from "@mui/material";
import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import AppTheme from "@/theme/AppTheme";
import LoadConfig from "@/core/utils/ConfigLoader";
import { OldOattsConfig } from "@/core/model/OattsModel";

type RouterContext = {
  authentication: UserContextType;
  modules: CoursesContext;
  config: OldOattsConfig;
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
    if (config === undefined) {
      config = {
        courses: [],
        roles: [],
      };
    }
    return { config };
  },
});

function Root() {
  return (
    <AppTheme>
      <CssBaseline />
      <Outlet />
    </AppTheme>
  );
}
