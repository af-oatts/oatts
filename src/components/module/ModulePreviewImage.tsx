
/*
 * Copyright © 2026 DCS Corporation, 6909 Metro Park Drive Suite 500, Alexandria, VA 22310.
 * See the LICENSE file for rights & permissions.
 */

import { alpha, Box, BoxProps } from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";

export interface PreviewImageProps extends BoxProps {
  src?: string;
  completed?: boolean;
  name: string;
}

function ImageViewer(props: PreviewImageProps) {
  const { src, name, sx: parentSx, ...rest } = props;
  if (src === undefined) {
    return (
      <Box
        {...rest}
        sx={{
          ...parentSx,
          display: "grid",
          gridTemplateColumns: "1fr auto",
          alignItems: "center",
        }}
      >
        <Box
          sx={{
            color: "text.primary",
            fontSize: "3rem",
            textAlign: "start",
            overflow: "hidden",
            opacity: "0.6",
          }}
        >
          {name}
        </Box>
        <Box
          sx={{
            height: "100%",
            boxShadow: "-5px 0px 20px 20px",
            zIndex: 50,
          }}
        />
      </Box>
    );
  }

  return (
    <Box
      {...rest}
      component="img"
      sx={{
        ...parentSx,
        width: "100%",
        transform: "scale(1.1)",
      }}
      alt={name}
      src={src}
    ></Box>
  );
}

export default function CoursePreviewImage(props: PreviewImageProps) {
  const { src, name, completed } = props;

  return (
    <>
      <Box
        sx={{
          display: "grid",
          alignItems: "start",
          gridTemplateColumns: "1fr",
          gridTemplateRows: "1fr",
        }}
      >
        {completed ? (
          <Box
            sx={(theme) => ({
              gridColumn: "1",
              gridRow: "1",
              color: theme.palette.progress.complete,
              backgroundColor: alpha(theme.palette.grey[800], 0.33),
              backdropFilter: "blur(2px)",
              zIndex: 75,
            })}
          >
            <CheckIcon
              sx={{
                width: "100%",
                height: "100%",
                filter: `drop-shadow(1px 0px 0px white) 
                    drop-shadow(-1px -0px 0px white)`,
              }}
            />
          </Box>
        ) : (
          <></>
        )}
        <ImageViewer sx={{ gridColumn: "1", gridRow: "1" }} src={src} name={name} />
      </Box>
    </>
  );
}
