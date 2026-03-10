
/*
 * Copyright © 2026 DCS Corporation, 6909 Metro Park Drive Suite 500, Alexandria, VA 22310.
 * See the LICENSE file for rights & permissions.
 */

import { CompletionStatus, Course, CourseContent } from "@/core/model/OattsModel";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardOwnProps,
  Snackbar,
  SnackbarCloseReason,
  Stack,
  Typography,
} from "@mui/material";
import LinearProgressWithLabel from "../common/LinearProgressWithLabel";
import { ExportUserProgress } from "../../core/utils/DataExporter";
import { useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import User from "@/core/model/UserModel";
import { useSetOverlay } from "@/contexts/hooks/useOverlay";
import InformedConsent from "@/components/dashboard/InformedConsent";
import { FlattenContents } from "@/utils/Flattener";
import { useUser } from "@/contexts/hooks/useUser";
import { useSetStatus, useStatuses } from "@/contexts/hooks/useStatus";
import { Status } from "@/core/model/Status";

export interface StatusTileProps extends CardOwnProps {
  requiredCourses: Course[];
  mayCollectData: boolean;
}

function SucceededAlert() {
  return (
    <Alert severity="success" variant="filled" sx={{ width: "100%" }}>
      Exported Successfully
    </Alert>
  );
}

function FailedAlert(msg?: string) {
  return (
    <Alert severity="error" variant="filled" sx={{ width: "100%" }}>
      <Stack>
        <Typography>Failed to export</Typography>
        <Typography variant="caption">{msg}</Typography>
      </Stack>
    </Alert>
  );
}

export default function DashboardStatusBar(props: StatusTileProps) {
  const { requiredCourses: courses, ...rest } = props;
  const [snackOpen, setSnackOpen] = useState(false);
  const [snackContent, setSnackContent] = useState(<Box></Box>);
  const allContents = courses.reduce((acc: CourseContent[], course) => [...acc, ...FlattenContents(course.contents)], []).filter(c => !c.children);
  const statuses = useStatuses(allContents.map(c => c.id));
  const progress = allContents && statuses ? calculateProgress(allContents, statuses) : 0;
  const setOverlay = useSetOverlay();
  const navigate = useNavigate();
  const user = useUser();

  const setStatus = useSetStatus();
  if (process.env.NODE_ENV !== 'production') {
    useMemo(() => {
      // @ts-ignore
      window.SET_EVERY_STATUS = async (status: CompletionStatus) => {
        for (let content of allContents) {
          if (content.children) {
            continue;
          }
          setStatus(content.id, { completionStatus: status });
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      };
    }, []);
  }

  const isComplete = progress == 100;

  function handleClose(_event: React.SyntheticEvent | Event, reason?: SnackbarCloseReason) {
    if (reason === "clickaway") {
      return;
    }

    setSnackOpen(false);
  }

  async function DoExport(user?: User) {
    setOverlay(
      <InformedConsent
        onConsented={async (attestation) => {
          const result = await ExportUserProgress(user, attestation);
          if (result.success) {
            setSnackContent(SucceededAlert());
          } else {
            setSnackContent(FailedAlert(result.message));
          }
          setSnackOpen(true);
          setOverlay(null);
        }}
      ></InformedConsent>,
    );
  }

  return (
    <>
      <Card {...rest} variant="elevation">
        <CardContent
          sx={{
            height: "100%",
            display: "grid",
            alignItems: "center",
            gridTemplateColumns: "1fr 1fr auto",
            gap: "10px",
          }}
        >
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "auto 10px 1fr",
              alignItems: "center",
            }}
          >
            <Typography sx={{ gridArea: "1 / 1", userSelect: "none" }}>Progress</Typography>
            <Box sx={{ gridArea: "1 / 3" }}>
              <LinearProgressWithLabel value={progress} />
            </Box>
          </Box>
          {props.mayCollectData ? (
            <Button sx={{ gridColumn: "3" }} size="small" onClick={() => DoExport(user.user)}>
              Export Data to Participate Research
            </Button>
          ) : (
            <></>
          )}
          {isComplete && (
            <Button sx={{ gridColumn: "4" }} size="small" onClick={() => navigate({ to: "/certificate" })}>
              View Certificate
            </Button>
          )}
        </CardContent>
      </Card>
      <Snackbar
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        open={snackOpen}
        autoHideDuration={4000}
        onClose={handleClose}
      >
        {snackContent}
      </Snackbar>
    </>
  );
}



function calculateProgress(contents: CourseContent[], statuses: Map<string, Status | undefined>) {
  if (contents.length <= 0) {
    return 100;
  }
  let numComplete = contents.filter(content => statuses.get(content.id)?.completionStatus === CompletionStatus.Completed).length;

  return (numComplete / contents.length) * 100;
}