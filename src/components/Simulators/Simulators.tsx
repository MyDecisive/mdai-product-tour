import { Box, Grid } from "@mui/material";
import { useGetPanelContent } from "../../hooks/useGetPanelContent";
import { ConfigText } from "./Config";
import { LogsSimulator } from "./Logs";
import { SimulatorBox } from "./SimulatorBox";
import { Status } from "./Status";
import { Terminal } from "./Terminal";

export function Simulators() {
  const {
    inTour,
    panelState: { config, terminal, status, logs },
  } = useGetPanelContent();

  return (
    <Box
      sx={{
        width: "100%",
        display: inTour ? "block" : "none",
      }}
    >
      {inTour ? (
        <Grid
          container
          rowSpacing={2}
          columnSpacing={{ xs: 1, sm: 2, md: 3 }}
          justifyContent={"space-evenly"}
          alignItems={"stretch"}
          sx={{ width: "100%" }}
        >
          <Grid size={5} sx={{ overflow: "hidden" }}>
            <SimulatorBox
              title="Config"
              link="View Config in GitHub →"
              href={config?.href}
              active={!!config?.active}
            >
              {config !== null && <ConfigText />}
            </SimulatorBox>
          </Grid>

          <Grid size={6.5}>
            <SimulatorBox title="Status" active={!!status?.active}>
              {status !== null && <Status />}
            </SimulatorBox>
          </Grid>

          <Grid size={5}>
            <SimulatorBox
              title="Terminal"
              innerStyles={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-end",
              }}
              active={!!terminal?.active}
            >
              {terminal !== null && <Terminal />}
            </SimulatorBox>
          </Grid>

          <Grid size={6.5}>
            <SimulatorBox title="Tail Logs" active={!!logs?.active}>
              {logs !== null && <LogsSimulator />}
            </SimulatorBox>
          </Grid>
        </Grid>
      ) : null}
    </Box>
  );
}
