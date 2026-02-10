import PostQuizPage from "@/components/quiz/PostQuizPage";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/_authorized/postquiz")({
  component: PostQuizPage,
});
