import { Box, List } from "@mui/material";
import { ContentMenuItem } from "@/components/common/ContentMenu";
import { useNavigate, useParams } from "@tanstack/react-router";
import { CourseController } from "./useCourseContentState";

const SHORT_ROUTE = "/courses/$courseId/content/$contentId";
const FILE_ROUTE = "/_authenticated/_authorized/courses/$courseId/content/$contentId";

export function CourseContentSideNav({ controller }: { controller: CourseController }) {
  const { courseId, contentId } = useParams({ from: FILE_ROUTE });
  const navigate = useNavigate({ from: SHORT_ROUTE });

  if (controller.isLoading) return <></>;

  return (
    <Box sx={{ overflowY: "auto" }}>
      <List component="nav">
        {(controller.contents || []).map((c) => (
          <ContentMenuItem
            key={c.id}
            state={controller.getState(c.id)}
            contentItem={c}
            isSelected={() => contentId === c.id}
            setContent={(id) => navigate({ to: SHORT_ROUTE, params: { courseId, contentId: id } })}
          />
        ))}
      </List>
    </Box>
  );
}
