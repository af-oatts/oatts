import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { useOverlayContent } from "@/contexts/hooks/useOverlay";
import { IScormApi, ScormApi } from "@/core/scorm/ScormApi";
import { Divider, Stack } from "@mui/material";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: async ({ context }) => {
    const { user } = context.authentication;
    if (user === undefined) throw redirect({ to: "/login" });
  },
  component: Layout,
});

function Layout() {
  let ctx = Route.useRouteContext();
  let [api, _] = useState<IScormApi>(new ScormApi());
  window.API_1484_11 = api;
  const { user } = ctx.authentication;
  if (user !== undefined) {
    api.SetUser(user);
  }

  return (
    <div style={{ display: "grid", width: "100%", height: "100%" }}>

      <Overlay />
      <div style={{ gridArea: "1/1", zIndex: 0 }}>
        <Stack sx={{ height: "100%", width: "100%", position: "relative", overflow: "hidden" }}>
          <DashboardHeader />
          <Divider />
          <Outlet />
        </Stack>
      </div>
    </div>
  );
}



const Overlay = () => {
  const content = useOverlayContent();
  if (content == null) {
    return <></>
  }
  return (<div style={{
    gridArea: "1/1",
    zIndex: 999,
    width: "100vw",
    height: "100vh",
    backgroundColor: "transparent"
  }}>
    {content}
  </div>)
}