import { ReactNode } from "react";
import ModuleNotFound from "@/components/module/ModuleNotFound";
import ModuleViewer from "@/components/module/ModuleViewer";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/_authorized/modules/$moduleId")({
  component: ModulePage,
  loader: async ({ params, context }) => {
    if (params.moduleId === undefined) return undefined;

    const module = context.modules.courses?.find((mod) => mod.id == params.moduleId);
    const user = context.authentication.user;
    if (module === undefined || user === undefined) return undefined;

    return module;
  },
});

export default function ModulePage(): Readonly<ReactNode> {
  const module = Route.useLoaderData();

  if (module === undefined) {
    return <ModuleNotFound />;
  }
  return <ModuleViewer contents={module.contents} paNumber={module.paNumber} />;
}
