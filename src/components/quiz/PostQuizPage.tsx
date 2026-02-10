import { Navigate, useNavigate } from "@tanstack/react-router";
import { addUserStatusFlag } from "../../core/authentication/UserStatusFlag";
import { UserStatusFlag } from "@/core/model/UserModel";

import { usePostquizController } from "@/contexts/hooks/usePostquizController";
import { BigLoadingScreen } from "../common/BigLoadingScreen";
import { useUser } from "@/contexts/hooks/useUser";

export default function PostQuizPage() {
  const navigate = useNavigate();
  const controller = usePostquizController();
  const { user } = useUser();

  if (controller.isLoading) return <BigLoadingScreen name="post quiz" />;

  if (controller.checkIsComplete()) {
    if (!user) {
      throw new Error("Cannot mark user as postquizzed. User is undefined! (Honestly how did this even happen...)");
    }
    addUserStatusFlag(user, UserStatusFlag.PostQuizzed).then(() => navigate({ to: "/" }));
    return <BigLoadingScreen name="certificate" />;
  }

  return (
    <Navigate
      to={"/courses/$courseId/postquiz/$contentId"}
      params={{
        courseId: controller.course?.id || "",
        contentId: controller.getNext(),
      }}
    />
  );
}
