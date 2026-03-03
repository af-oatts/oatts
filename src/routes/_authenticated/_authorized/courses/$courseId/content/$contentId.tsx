import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router";

import { useCourse } from "@/contexts/providers/CourseContextProvider";
import CourseView from "@/components/module/CourseView";
import { CircularProgress } from "@mui/material";


const FILE_ROUTE = `/_authenticated/_authorized/courses/$courseId/content/$contentId`;

export const Route = createFileRoute(FILE_ROUTE)({
  component: RouteComponent,
});

function RouteComponent() {
  const { courseId, contentId } = useParams({ from: FILE_ROUTE });
  const [course, isLoading] = useCourse(courseId);
  const navigate = useNavigate();
  const setContentID = (newContentId: string) => {
    navigate({ to: '.', params: { contentId: newContentId } });
  }

  const finish = () => {
    navigate({ to: "/dashboard" })
  }
  if (isLoading || !course) {
    return <CircularProgress />
  }
  return <CourseView contentID={contentId} contents={course.contents} courseName={course.name} finish={finish} setContentID={setContentID} />;
}
