
/*
 * Copyright © 2026 DCS Corporation, 6909 Metro Park Drive Suite 500, Alexandria, VA 22310.
 * See the LICENSE file for rights & permissions.
 */

import { Box } from "@mui/material";

export function PdfViewer({ pdf }: { pdf: string }) {
  return (
    <Box style={{ height: "100%", width: "100%", overflow: "hidden" }}>
      <object data={pdf + "#view=FitH"} width="100%" height="100%" initial-scale="100%" type="application/pdf"></object>
    </Box>
  );
}
