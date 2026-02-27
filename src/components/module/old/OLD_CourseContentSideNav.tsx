import { Box, List } from "@mui/material";
import { OLD_ContentMenuItem } from "@/components/module/old/OLD_ContentMenu";
import { useNavigate, useParams } from "@tanstack/react-router";
import { CourseController } from "../../../contexts/models/CourseController";
import { OLD_getFileRoute, OLD_getShortFileRoute } from "./OLD_getFileRoute";

export function OLD_CourseContentSideNav({ controller }: { controller: CourseController }) {
  const FILE_ROUTE = OLD_getFileRoute(controller.contentType);
  const SHORT_ROUTE = OLD_getShortFileRoute(controller.contentType);
  const { courseId, contentId } = useParams({ from: FILE_ROUTE });
  const navigate = useNavigate({ from: SHORT_ROUTE });

  if (controller.isLoading) return <></>;

  return (
    <Box sx={{ overflowY: "auto" }}>
      <List component="nav">
        {(controller.contents || []).map((c) => (
          <OLD_ContentMenuItem
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
