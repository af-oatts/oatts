
/*
 * Copyright © 2026 DCS Corporation, 6909 Metro Park Drive Suite 500, Alexandria, VA 22310.
 * See the LICENSE file for rights & permissions.
 */

import Markdown from 'react-markdown';
import IconButton from '@mui/material/IconButton';
import SaveIcon from '@mui/icons-material/Save';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import { Card, Typography, Box } from '@mui/material';
import { invoke } from '@tauri-apps/api/core';

export default function Legalese({
  legaleseMd,
  title,
  height = 300,
}: {
  legaleseMd: string;
  title: string;
  height?: number;
}) {
  const handleSave = async () => {
    invoke("export_legalese", {contents: legaleseMd, suggestedName: title + ".md"});
  };

  return (
    <Card variant="outlined" sx={{ position: 'relative' }}>
      {/* Header Row */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 10px',
          borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
        }}
      >
        <Typography variant="h5" fontWeight={600}>
          {title}
        </Typography>

        <Stack direction="row" spacing={1}>
          <Tooltip title={`Save ${title}`} arrow>
            <IconButton size="small" color="primary" onClick={handleSave}>
              <SaveIcon />
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>

      {/* Content */}
      <Box
        sx={{
          height, // <- use the prop directly
          overflowY: 'scroll',
          p: 1,
          /* Firefox */
          scrollbarWidth: 'thin',
          scrollbarColor: '#888 transparent',
          /* Chrome, Edge, Safari */
          '&::-webkit-scrollbar': { width: '6px' },
          '&::-webkit-scrollbar-thumb': { backgroundColor: '#888', borderRadius: '3px' },
          '&::-webkit-scrollbar-track': { background: 'transparent' },
        }}
      >
        <Markdown>{legaleseMd}</Markdown>
      </Box>
    </Card>
  );
}
