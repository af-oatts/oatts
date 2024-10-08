import { Box } from "@mui/material";

export function PdfViewer({ pdf }: { pdf: string }) {
  return (
    <Box style={{ height: "100%", width: "100%", overflow: "hidden" }}>
      <object data={pdf + "#view=FitH"} width="100%" height="100%" initial-scale="100%" type="application/pdf"></object>
    </Box>
  );
}
