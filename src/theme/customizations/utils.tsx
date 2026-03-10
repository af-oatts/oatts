
/*
 * Copyright © 2026 DCS Corporation, 6909 Metro Park Drive Suite 500, Alexandria, VA 22310.
 * See the LICENSE file for rights & permissions.
 */

import { Components, Theme } from "@mui/material";

export const utilsCustomizations: Components<Theme> = {
  MuiModal: {
    styleOverrides: {
      root: {
        // position: 'absolute',
        // top: '50%',
        // left: '50%',
        //transform: 'translate(-50%, -50%)',
        width: 400,
        bgcolor: "background.paper",
        border: "2px solid #000",
        boxShadow: 24,
        p: 4,
        variants: [],
      },
    },
  },
};
