import Grid from '@mui/material/Grid';
import { Typography, Box, Link } from "@mui/material";

export function Simulators() {
  return (
    <Box sx={{ width: '100%', p: 3 }}>
      <Grid container rowSpacing={2} columnSpacing={{ xs: 1, sm: 2, md: 3 }} sx={{ width: '100%'}}>
        <Grid size={5}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <Typography variant="subtitle1">Config</Typography>
            <Link href="#" variant="body2" underline="hover">View Config in GitHub →</Link>
          </Box>
          <Box sx={{ p: 1, minHeight: '350px', border: '2px solid #B062C2 !important', borderRadius: '4px', background: '#393939' }}>
          </Box>
        </Grid>
        <Grid size={6.5}>
        <Typography variant="subtitle1">Status</Typography>
          <Box sx={{ p: 1, minHeight: '350px', borderRadius: '4px', background: '#393939' }}>
          </Box>
        </Grid>
        <Grid size={5}>
        <Typography variant="subtitle1">Terminal</Typography>
          <Box sx={{ p: 1, minHeight: '350px', borderRadius: '4px', background: '#393939' }}>
          </Box>
        </Grid>
        <Grid size={6.5}>
        <Typography variant="subtitle1">Tail Logs</Typography>
          <Box sx={{ p: 1, minHeight: '350px', borderRadius: '4px', background: '#393939' }}>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
