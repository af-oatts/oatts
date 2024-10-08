
import { Box, Container, Typography, Stack, Button, Divider } from '@mui/material';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';


export default function ErrorPage() {

  const handleHome = () => {
    try {
      window.location.assign('/');
    } catch { }
  };

  const handleReload = () => {
    try {
      window.location.reload();
    } catch { }
  };

  return (
    <Box
      sx={{
        minHeight: '100dvh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
        px: 2,
      }}
    >
      <Container maxWidth="sm">
        <Box
          sx={{
            bgcolor: 'background.paper',
            borderRadius: 3,
            boxShadow: (t) => t.shadows[8],
            p: { xs: 3, sm: 4 },
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}
        >

          <Stack spacing={2.25} sx={{ position: 'relative', zIndex: 1 }}>
            <Typography variant="h3" component="h1" fontWeight={700}>
              Something Broke.
            </Typography>
            <img src='error.png' style={{borderRadius:'10px'}}/>
            
            <Typography variant="h6" color="text.secondary">
              No Details Available.
            </Typography>

            <Divider sx={{ my: 1.5 }} />
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={1.25}
              justifyContent="center"
            >
              <Button
                variant="contained"
                onClick={handleReload}
                startIcon={<RefreshRoundedIcon />}
              >
                Reload
              </Button>
              <Button
                variant="outlined"
                onClick={handleHome}
                startIcon={<HomeRoundedIcon />}
              >
                Go Home
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
}
