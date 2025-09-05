import { Box } from "@mui/material";
import Grid from "@mui/material/Grid";
import { useEffect, useMemo } from "react";
import { useNavigation } from "../../hooks/useNavigation";
import { useSimRunner } from "../../hooks/useSimRunner";
import type { Service } from "../../utils/types";
import {
  getSimScriptKey,
  registerSims,
  selectSimScript,
} from "../../views/common";
import { LOGS_SIMS } from "../../views/Logs/simsContent";
import { ConfigText } from "./Config";
import LogSimulator from "./Logs/Logs";
import { SimulatorBox } from "./SimulatorBox";
import { Status } from "./Status/Status";
import { Terminal } from "./Terminal";

const services: Service[] = [
  { name: "web-server", replicas: 2 },
  { name: "api-gateway" },
  { name: "database" },
];

export function Simulators() {
  const navigation = useNavigation();
  const key = useMemo(
    () => getSimScriptKey(navigation.view, navigation.step, navigation.substep),
    [navigation]
  );
  const script = useMemo(() => selectSimScript(key), [key]);
  const sim = useSimRunner(script);

  useEffect(() => {
    registerSims("Logs", LOGS_SIMS);
  }, []);

  return (
    <Box
      sx={{
        width: "100%",
        p: 3,
        display: navigation.view === "Home" ? "none" : "block",
      }}
    >
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
            href={sim.config.href}
            innerStyles={{ border: "2px solid #B062C2" }}
          >
            <ConfigText
              text={sim.config.text}
              activeRange={sim.config.range}
              view={navigation.view}
              title={sim.config.name}
            />
          </SimulatorBox>
        </Grid>

        <Grid size={6.5}>
          <SimulatorBox title="Status">
            <Box sx={{ p: 1, whiteSpace: "pre-wrap" }}>
              <Status
                services={services}
                onAllStabilized={() => console.log("All services running")}
              />
            </Box>
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
          >
            <Terminal />
          </SimulatorBox>
        </Grid>

        <Grid size={6.5}>
          <SimulatorBox title="Tail Logs">
            <LogSimulator />
          </SimulatorBox>
        </Grid>
      </Grid>
    </Box>
  );
}
