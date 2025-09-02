import { useEffect, useState } from "react";
import Grid from "@mui/material/Grid";
import { SimulatorBox } from "./SimulatorBox";
import { Box } from "@mui/material";
import { useNavigation } from "../../hooks/useNavigation";
import { ConfigText } from "./Config";
import mdaiHubSample from "./configSamples/mdaiHubSample.yaml?raw";
import otelSample from "./configSamples/otelSample.yaml?raw";

type ActiveViewSim = {
  configFile: typeof mdaiHubSample;
  start?: number;
  end?: number;
};

export function Simulators() {
  const [activeSims, setActiveSims] = useState<ActiveViewSim | undefined>(undefined);
  const navigation = useNavigation();
  console.log(navigation);

  useEffect(() => {
    if (navigation.view === "Logs" && navigation.substep === "step1_configure") {
       setActiveSims({ configFile: otelSample });
       return;
    } else if (navigation.view === "Logs" && navigation.substep === "step2_configure") {
      setActiveSims({ configFile: mdaiHubSample, start: 80, end: 92 });
      return;
    } else {
      setActiveSims(undefined);
    }
  }, [navigation.view, navigation.substep]);

  return (
    <Box sx={{ width: "100%", p: 3, display: navigation.view === "Home" ? "none" : "block" }}>
      <Grid
        container
        rowSpacing={2}
        columnSpacing={{ xs: 1, sm: 2, md: 3 }}
        sx={{ width: "100%" }}
      >
        <Grid size={5} sx={{ overflow: "hidden" }}>
          <SimulatorBox
            title="Config"
            link="View Config in GitHub →"
            href="#"
            innerStyles={{
              border: "2px solid #B062C2",
            }}
            children={<ConfigText text={activeSims?.configFile} activeRange={activeSims?.start !== undefined && activeSims?.end !== undefined ? { start: activeSims.start, end: activeSims.end } : undefined} view={navigation.view} />}
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
