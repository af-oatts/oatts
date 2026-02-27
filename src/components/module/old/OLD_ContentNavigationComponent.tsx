import { Button, Typography } from "@mui/material";

import { useNavigate, useParams } from "@tanstack/react-router";
import { ContentType } from "../../../contexts/models/ContentType";
import { OLD_getFileRoute, OLD_getShortFileRoute } from "./OLD_getFileRoute";

export function OLD_ContentNavigationComponent({
  next,
  contentName,
  contentType = "content",
}: {
  next: string;
  contentName?: string;
  contentType?: ContentType;
}) {
  const FILE_ROUTE = OLD_getFileRoute(contentType);
  const SHORT_FILE_ROUTE = OLD_getShortFileRoute(contentType);
  const { courseId } = useParams({ from: FILE_ROUTE });
  const navigate = useNavigate();

  function toDashboard() {
    navigate({ to: "/dashboard" });
  }

  function nextItem() {
    if (next) {
      navigate({ to: SHORT_FILE_ROUTE, params: { courseId, contentId: next } });
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

  if (contentType === "prequiz") {
    return (
      <>
        <Typography variant="h6">PreQuiz Complete</Typography>
        <Button
          sx={{ width: "10em", justifySelf: "end" }}
          variant="contained"
          onClick={() => navigate({ to: "/onboarding/preQuizComplete" })}
        >
          Continue
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
