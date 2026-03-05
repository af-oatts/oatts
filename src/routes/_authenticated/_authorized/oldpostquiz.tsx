import PostQuizPage from "@/components/module/old/OLD_PostQuizPage";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/_authorized/oldpostquiz")({
  component: PostQuizPage,
});
