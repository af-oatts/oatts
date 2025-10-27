import { Alert, Box, Button, Snackbar, Stack, Typography } from "@mui/material";
import { Link } from "@tanstack/react-router";

import CourseCard from "@/components/common/ModuleCard";
import DashboardStatusBar from "@/components/dashboard/DashboardStatusBar";
import { Course } from "@/core/model/OattsModel";
import CheckForUpdates from "@/core/modules/UpdateChecker";
import { useEffect, useState } from "react";

export function CoursesView({ required, optional, mayCollectData}: { required: Course[]; optional: Course[], mayCollectData: boolean}) {
  const [showUpdatePopup, setShowUpdatePopup] = useState(false);
  useEffect(() => {
    CheckForUpdates().then((u) => {
      if (u.updateAvailable) {
        setShowUpdatePopup(true);
      }
    });
  }, [])
  return (
    <Box
      sx={(theme) => ({
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        overflow: "auto",
        height: "100%",
        background: theme.palette.background.gradient,
      })}
    >
      <Box sx={{ margin: "5px" }}>
        <DashboardStatusBar sx={{ height: "100%" }} courses={required} mayCollectData={mayCollectData} />
      </Box>
      <CoursesRack label="Focused Modules" courses={required} />
      <CoursesRack label="Supplemental Modules" courses={optional} />
      <Snackbar
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        open={showUpdatePopup}
        onClose={() => setShowUpdatePopup(false)}
      >
        <Alert severity="info" variant="filled" sx={{ width: "100%" }}>
          <Typography fontWeight='bold'>A new version of OATTS is available</Typography>
          <Stack direction='row' gap={1} p={1} >
            <Button variant="contained" size="small" sx={{width: '70%'}} href={"https://af-oatts.github.io/" }target="_blank">Update</Button>
            <Button variant="contained" color="success"  size="small" onClick={() => setShowUpdatePopup(false)}>Ignore</Button>
          </Stack>
        </Alert>
      </Snackbar>
    </Box>
  );
}

export function CoursesRack({ label, courses }: { label: string; courses: Course[] }) {
  return (
    <>
      <Box sx={{ display: "flex", flexDirection: "column" }}>
        <Typography
          variant="h6"
          sx={(theme) => ({ userSelect: "none", margin: "0px 5px", opacity: 1, color: theme.palette.text.secondary })}
        >
          {label}
        </Typography>
        <Box
          sx={(theme) => ({
            borderColor: theme.palette.text.primary,
            borderStyle: "solid",
            borderWidth: "2px",
            opacity: 0.3,
            maskImage: `linear-gradient(to right, ${theme.palette.text.primary}, transparent)`,
          })}
        />
      </Box>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, 15rem)",
          gridAutoRows: "1fr",
          gap: "1rem",
          padding: "5px",
        }}
      >
        {courses.map((course, idx) => (
          <Box key={idx} sx={{ height: "100%" }}>
            <Link to={`/modules/$moduleId`} style={{ textDecoration: 'none' }} params={{ moduleId: course.id }}>
              <CourseCard course={course} />
            </Link>
          </Box>
        ))}
      </Box>
    </>
  );
}
