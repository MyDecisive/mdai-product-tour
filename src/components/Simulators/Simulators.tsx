import { Box, Button, Grid } from "@mui/material";
import { useEffect, useRef } from "react";
import { useAnimationEngine } from "../../animationEngine/hook";
import { SIMULATORS } from "../../utils/constants";
import type {
  EngineFrames,
  EngineTargetState,
} from "../../utils/engineTypesScratch";
import { ConfigText } from "./Config.tsx";
import { LogsSimulator } from "./Logs";
import { SimulatorBox } from "./SimulatorBox";
import { Status } from "./Status";
import { Terminal } from "./Terminal";

interface SimulatorsProps {
  targetState: EngineTargetState;
  previousState: EngineTargetState;
  frames: EngineFrames.Any[];
  onComplete: () => void;
}

export function Simulators({
  targetState,
  previousState,
  frames,
  onComplete,
}: SimulatorsProps) {
  const [engineState, engineControls] = useAnimationEngine(
    targetState,
    frames,
    previousState,
    onComplete
  );

  const simContainerParentRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (
      // engineState.activeSimulator.has(SIMULATORS.CONFIG) ||
      engineState.activeSimulator.has(SIMULATORS.STATUS)
    ) {
      if (simContainerParentRef.current) {
        simContainerParentRef.current.scrollTo({ top: 0, behavior: "smooth" });
      }
    } else if (
      // engineState.activeSimulator.has(SIMULATORS.LOGS) ||
      engineState.activeSimulator.has(SIMULATORS.TERMINAL)
    ) {
      if (simContainerParentRef.current) {
        simContainerParentRef.current.scrollTop =
          simContainerParentRef.current.scrollHeight;
      }
    }
  }, [engineState.activeSimulator]);

  const config = null;
  const logs = null;

  return (
    <Box
      sx={{ flexGrow: 1, overflow: "auto", scrollBehavior: "smooth" }}
      ref={simContainerParentRef}
    >
      <Button onClick={() => engineControls.reset("button press")}>
        reset
      </Button>
      <Button onClick={() => engineControls.play("button press")}>play</Button>
      <Box
        className="simulators-container"
        sx={{
          display: "block",
          // display: inTour ? "block" : "none",
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
              title="Config"
              // active={engineState.activeSimulator.has(SIMULATORS.CONFIG)}
            >
              {config !== null && <ConfigText />}
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
                  podOrder={engineState.currentSimulatorState.status.podOrder}
                  onPodStatusChange={engineControls.onPodStatusChange}
                  onAnimationComplete={engineControls.advanceAnimation}
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
                  onAnimationComplete={engineControls.advanceAnimation}
                  playing={engineState.isPlaying} // TODO: put sim play state in sim state node?
                  state={engineState?.currentSimulatorState?.terminal?.strings}
                />
              )}
            </SimulatorBox>
          </Grid>

          <Grid size={6.5}>
            <SimulatorBox
              title="Tail Logs"
              // active={engineState.activeSimulator.has(SIMULATORS.LOGS)}
              innerStyles={{
                padding: "24px 14px 16px 14px",
                boxSizing: "border-box",
                minHeight: "394px",
              }}
            >
              {logs !== null && <LogsSimulator />}
            </SimulatorBox>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
