import { Box, Button, Grid } from "@mui/material";
import { useEffect, useRef } from "react";
import { useAnimationEngine } from "../../animationEngine/hook";
import type { SubstepConfig } from "../../utils/configTypesScratch";
import { FRAME_TYPES, SIMULATORS } from "../../utils/constants";
import type { EngineTargetState } from "../../utils/engineTypesScratch";
import {
  terminalAutoLines,
  userEntry,
} from "../../views/Logs/terminal/terminalContent";
import { ConfigText } from "./Config";
import { LogsSimulator } from "./Logs";
import { SimulatorBox } from "./SimulatorBox";
import { Status } from "./Status";
import { Terminal } from "./Terminal";

/** hard coded stuff for dev */
const previousState: EngineTargetState = {
  terminal: {
    strings: [],
  },
  //   config: {
  //     files: {
  //       "deployment.yaml": {
  //         text: `apiVersion: apps/v1
  // kind: Deployment
  // metadata:
  //   name: web-app
  // spec:
  //   replicas: 3
  //   selector:
  //     matchLabels:
  //       app: web
  //   template:
  //     metadata:
  //       labels:
  //         app: web
  //     spec:
  //       containers:
  //       - name: nginx
  //         image: nginx:1.21
  //         ports:
  //         - containerPort: 80`,
  //       },
  //     },
  //     activeFile: "deployment.yaml",
  //   },
  status: {
    activePods: {
      "web-app-default^1@0": {
        id: "web-app-default^1@0",
        name: "web-app-2izah",
        namespace: "default",
        status: "Running",
        parentServiceKey: "web-app-default^3@0",
        replicaNo: 1,
        restartCount: 0,
      },
      "web-app-default^2@0": {
        id: "web-app-default^2@0",
        name: "web-app-mttlc",
        namespace: "default",
        status: "Running",
        parentServiceKey: "web-app-default^3@0",
        replicaNo: 2,
        restartCount: 0,
      },
      "web-app-default^3@0": {
        id: "web-app-default^3@0",
        name: "web-app-5gw8e",
        namespace: "default",
        status: "Running",
        parentServiceKey: "web-app-default^3@0",
        replicaNo: 3,
        restartCount: 0,
      },
    },
    podOrder: [
      "web-app-default^1@0",
      "web-app-default^2@0",
      "web-app-default^3@0",
    ],
  },
};

const substep: SubstepConfig = {
  id: "deploy-app",
  label: "Deploy Application",
  content: {
    type: "text",
    text: "this is substep content",
  },
  animation: [
    {
      type: FRAME_TYPES.enter_command,
      simulator: SIMULATORS.TERMINAL,
      updates: [
        {
          input: userEntry[0],
          outputs: terminalAutoLines,
        },
      ],
    },
    {
      type: FRAME_TYPES.add_services,
      simulator: SIMULATORS.STATUS,
      updates: [
        {
          name: "web-app",
          namespace: "default",
          replicas: 3,
        },
      ],
    },
  ],
  targetState: {
    terminal: [
      {
        // typedOptions: ([] as string[]).concat(terminalAutoLines, userEntry, [""]),
        input: "",
      },
    ],
    // config: {
    //   files: {
    //     "deployment.yaml": {
    //       text: previousState.config!.files["deployment.yaml"].text,
    //     },
    //   },
    //   activeFile: "deployment.yaml",
    // },
    status: [
      {
        name: "web-app",
        namespace: "default",
        replicas: 3,
      },
    ],
  },
};
/** end hard coded dev stuff */

function onComplete() {
  console.log("animation complete!!");
}

export function Simulators() {
  const [engineState, engineControls] = useAnimationEngine(
    substep,
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
              {engineState.currentSimulatorState.status !== null && (
                <Status
                  activePods={
                    engineState.currentSimulatorState.status!.activePods
                  }
                  podOrder={engineState.currentSimulatorState.status!.podOrder}
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
              {engineState.currentSimulatorState.terminal !== null && (
                <Terminal
                  onAnimationComplete={engineControls.advanceAnimation}
                  playing={engineState.isPlaying} // TODO: put sim play state in sim state node
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
