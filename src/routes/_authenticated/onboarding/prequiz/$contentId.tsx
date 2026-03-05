import CourseView from "@/components/module/CourseView";
import { usePrequiz } from "@/contexts/providers/CourseContextProvider";
import { CourseContent } from "@/core/model/OattsModel";
import { CircularProgress } from "@mui/material";
import { createFileRoute, Navigate, useNavigate, useParams } from "@tanstack/react-router";
import { useMemo } from "react";

const FILE_ROUTE = `/_authenticated/onboarding/prequiz/$contentId`;

export const Route = createFileRoute(FILE_ROUTE)({
  component: RouteComponent,
});

function RouteComponent() {
  const { contentId } = useParams({ from: FILE_ROUTE });
  const prequizCourses = usePrequiz();
  const navigate = useNavigate();

  const setContentID = (newContentId: string) => {
    navigate({ to: '.', params: { contentId: newContentId } });
  }

  const finish = () => {
    navigate({ to: "/onboarding/preQuizComplete" })
  }


  if (prequizCourses == null) {
    return <Navigate to="/dashboard"/>
  }
  
  if (prequizCourses == undefined) {
    return <CircularProgress />
  }


  const contents = useMemo(() => prequizCourses?.reduce((acc: CourseContent[], course) => [...acc, ...course.contents], []), [prequizCourses])


  return <CourseView contents={contents} contentID={contentId} courseName="Prequiz" finish={finish} setContentID={setContentID} />;
}
