import { Button, Typography } from "@mui/material";

import { useNavigate, useParams } from "@tanstack/react-router";
import { ContentType } from "./ContentType";

export function ContentNavigationComponent({
  next,
  contentName,
  contentType = "content",
}: {
  next: string;
  contentName?: string;
  contentType?: ContentType;
}) {
  const { courseId } = useParams({ from: `/_authenticated/_authorized/courses/$courseId/${contentType}/$contentId` });
  const navigate = useNavigate();

  function toDashboard() {
    navigate({ to: "/dashboard" });
  }

  function nextItem() {
    if (next) {
      navigate({ to: `/courses/$courseId/${contentType}/$contentId`, params: { courseId, contentId: next } });
    }
  }

  if (next) {
    return (
      <>
        <Typography variant="h6">{contentName} Complete</Typography>
        <Button sx={{ width: "10em", justifySelf: "end" }} variant="contained" onClick={nextItem}>
          Next
        </Button>
      </>
    );
  }

  return (
    <>
      <Typography variant="h6">Module Complete</Typography>
      <Button sx={{ width: "10em", justifySelf: "end" }} variant="contained" onClick={toDashboard}>
        Dashboard
      </Button>
    </>
  );
}
