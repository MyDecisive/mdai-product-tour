import Grid from "@mui/material/Grid";
import { Box } from "@mui/material";
import { SimulatorBox } from "./SimulatorBox";

export function Simulators() {
  return (
    <Box sx={{ width: "100%", p: 3 }}>
      <Grid
        container
        rowSpacing={2}
        columnSpacing={{ xs: 1, sm: 2, md: 3 }}
        sx={{ width: "100%" }}
      >
        <Grid size={5}>
          <SimulatorBox
            title="Config"
            link="View Config in GitHub →"
            href="#"
            innerStyles={{
              border: "2px solid #B062C2",
            }}
          />
        </Grid>
        <Grid size={6.5}>
          <SimulatorBox
            title="Status"
          />
        </Grid>
        <Grid size={5}>
          <SimulatorBox
            title="Terminal"
          />
        </Grid>
        <Grid size={6.5}>
          <SimulatorBox
            title="Tail Logs"
          />
        </Grid>
      </Grid>
    </Box>
  );
}
