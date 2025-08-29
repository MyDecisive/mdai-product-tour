import { useEffect, useState } from "react";
import Grid from "@mui/material/Grid";
import { Box } from "@mui/material";
import { SimulatorBox } from "./SimulatorBox";
import { useNavigation } from "../../hooks/useNavigation";
import { ConfigText } from "./Config";
import configSample from "./data/configSample.yaml?raw";

export function Simulators() {
  const [activeRange, setActiveRange] = useState<{ start: number; end: number } | undefined>(undefined);
  const navigation = useNavigation();
  console.log(navigation);

  useEffect(() => {
    if (navigation.substep === "step2_configure") {
      setActiveRange({ start: 80, end: 92 });
    } else {
      setActiveRange(undefined);
    }
  }, [navigation.substep]);

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
            children={<ConfigText text={configSample} activeRange={activeRange} />}
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
