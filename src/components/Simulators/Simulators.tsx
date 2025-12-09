import { Box, Grid } from "@mui/material";
import { useEffect, useRef } from "react";
import { useDemoContext } from "../../hooks/useDemoContext";
import { SIMULATORS } from "../../utils/constants";
import { Config } from "./Config";
import { LogsSimulator } from "./Logs";
import { SimulatorBox } from "./SimulatorBox";
import { Status } from "./Status";
import { Terminal } from "./Terminal";

export function Simulators() {
  const { engineState, engineControls } = useDemoContext();

  const simContainerParentRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (
      engineState.activeSimulator.has(SIMULATORS.CONFIG) ||
      engineState.activeSimulator.has(SIMULATORS.STATUS)
    ) {
      if (simContainerParentRef.current) {
        simContainerParentRef.current.scrollTo({ top: 0, behavior: "smooth" });
      }
    } else if (
      engineState.activeSimulator.has(SIMULATORS.LOGS) ||
      engineState.activeSimulator.has(SIMULATORS.TERMINAL)
    ) {
      if (simContainerParentRef.current) {
        simContainerParentRef.current.scrollTop =
          simContainerParentRef.current.scrollHeight;
      }
    }
  }, [engineState.activeSimulator]);

  return (
    <Box
      sx={{ flexGrow: 1, overflow: "auto", scrollBehavior: "smooth" }}
      ref={simContainerParentRef}
    >
      <Box
        className="simulators-container"
        sx={{
          display: "block",
          flexGrow: 1,
          padding: "24px",
        }}
      >
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
              title="IDE"
              active={engineState.activeSimulator.has(SIMULATORS.CONFIG)}
            >
              {engineState.currentSimulatorState.config != null && (
                <Config
                  {...engineState.currentSimulatorState.config}
                  onSetActiveTab={engineControls.onSetActiveTab}
                  onToggleShowingChange={engineControls.onToggleShowingChange}
                  onConfigScrollComplete={engineControls.onConfigScrollComplete}
                />
              )}
            </SimulatorBox>
          </Grid>

          <Grid size={6.5}>
            <SimulatorBox
              title="Status"
              active={engineState.activeSimulator.has(SIMULATORS.STATUS)}
            >
              {engineState.currentSimulatorState.status != null && (
                <Status
                  activePods={
                    engineState.currentSimulatorState.status.activePods
                  }
                  playing={
                    engineState.isPlaying &&
                    engineState.activeSimulator.has(SIMULATORS.STATUS)
                  }
                  podOrder={engineState.currentSimulatorState.status.podOrder}
                  onPodStatusChange={engineControls.onPodStatusChange}
                />
              )}
            </SimulatorBox>
          </Grid>

          <Grid size={5}>
            <SimulatorBox
              title="Terminal"
              innerStyles={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-end",
                boxSizing: "border-box",
                maxHeight: "394px",
                height: "394px",
              }}
              active={engineState.activeSimulator.has(SIMULATORS.TERMINAL)}
            >
              {engineState.currentSimulatorState.terminal != null && (
                <Terminal
                  onTerminalContentPrinted={
                    engineControls.onTerminalContentPrinted
                  }
                  playing={
                    engineState.isPlaying &&
                    engineState.activeSimulator.has(SIMULATORS.TERMINAL)
                  }
                  state={engineState?.currentSimulatorState?.terminal?.strings}
                />
              )}
            </SimulatorBox>
          </Grid>

          <Grid size={6.5}>
            <SimulatorBox
              title="Tail Logs"
              active={engineState.activeSimulator.has(SIMULATORS.LOGS)}
              innerStyles={{
                padding: "24px 14px 16px 14px",
                boxSizing: "border-box",
                minHeight: "394px",
              }}
            >
              {engineState.currentSimulatorState.logs != null && (
                <LogsSimulator
                  {...engineState.currentSimulatorState.logs}
                  playing={
                    engineState.isPlaying &&
                    engineState.activeSimulator.has(SIMULATORS.LOGS)
                  }
                />
              )}
            </SimulatorBox>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
