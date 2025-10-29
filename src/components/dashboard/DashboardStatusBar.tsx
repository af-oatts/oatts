import { Course } from "@/core/model/OattsModel";
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
import { calculateCoursesProgress, checkIfRequirementsAreComplete } from "../../core/modules/ModuleUtils";
import LinearProgressWithLabel from "../common/LinearProgressWithLabel";
import { ExportUserProgress } from "../../core/utils/DataExporter";
import { useNavigate, useRouteContext } from "@tanstack/react-router";
import { useState } from "react";
import User from "@/core/model/UserModel";
import { useSetOverlay } from "@/contexts/hooks/useOverlay";
import InformedConsent from "@/components/dashboard/InformedConsent";

export interface StatusTileProps extends CardOwnProps {
  courses: Course[];
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
  const { courses: modules, ...rest } = props;
  const navigate = useNavigate();
  const [snackOpen, setSnackOpen] = useState(false);
  const [snackContent, setSnackContent] = useState(<Box></Box>);
  const ctx = useRouteContext({ from: "/_authenticated/_authorized" });
  const modulesProgress = Math.round(calculateCoursesProgress(modules) * 100);
  const setOverlay = useSetOverlay();

  const isComplete = checkIfRequirementsAreComplete(modules);

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
              <LinearProgressWithLabel value={modulesProgress} />
            </Box>
          </Box>
          {props.mayCollectData ? (
            <Button sx={{ gridColumn: "3" }} size="small" onClick={() => DoExport(ctx.authentication.user)}>
              Export Data
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
