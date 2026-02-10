import { Box, List } from "@mui/material";
import { ContentMenuItem } from "@/components/common/ContentMenu";
import { useNavigate, useParams } from "@tanstack/react-router";
import { CourseController } from "../../contexts/models/CourseController";
import { getFileRoute, getShortFileRoute } from "./getFileRoute";

export function CourseContentSideNav({ controller }: { controller: CourseController }) {
  const FILE_ROUTE = getFileRoute(controller.contentType);
  const SHORT_ROUTE = getShortFileRoute(controller.contentType);
  const { courseId, contentId } = useParams({ from: FILE_ROUTE });
  const navigate = useNavigate({ from: SHORT_ROUTE });

  if (controller.isLoading) return <></>;

  return (
    <Box sx={{ overflowY: "auto" }}>
      <List component="nav">
        {(controller.contents || []).map((c) => (
          <ContentMenuItem
            key={c.id}
            getState={(id) => controller.getState(id)}
            contentItem={c}
            isSelected={(id) => contentId === id}
            setContent={(id) => 
              navigate({ to: SHORT_ROUTE, params: { courseId, contentId: id } })
            }
          />
        ))}
      </List>
    </Box>
  );
}
