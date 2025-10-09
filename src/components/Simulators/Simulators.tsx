import { Box, Button, Grid } from "@mui/material";
import { useEffect, useRef } from "react";
import { useAnimationEngine } from "../../animationEngine/hook";
import { ANIMATION_TYPES, SIMULATORS } from "../../utils/constants";
import type {
  Animations,
  ServiceTarget,
  SimulatorTargetState,
  TerminalTypedOptions,
} from "../../utils/types";
import { startLogsTerminalContent } from "../../views/Logs/terminal/terminalContent";
import { ConfigText } from "./Config";
import { LogsSimulator } from "./Logs";
import { SimulatorBox } from "./SimulatorBox";
import { Status } from "./Status";
import { STATUS } from "./Status/constants";
import { Terminal } from "./Terminal";

/** hard coded stuff for dev */
const previousState: SimulatorTargetState = {
  terminal: {
    typedOptions: [] as TerminalTypedOptions[],
  },
  config: {
    files: {
      "deployment.yaml": {
        text: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: web-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: web
  template:
    metadata:
      labels:
        app: web
    spec:
      containers:
      - name: nginx
        image: nginx:1.21
        ports:
        - containerPort: 80`,
      },
    },
    activeFile: "deployment.yaml",
  },
  status: {
    services: [],
  },
  logs: {
    records: [],
  },
  banner: null,
};

const substep = {
  id: "deploy-app",
  label: "Deploy Application",
  animations: [
    {
      type: ANIMATION_TYPES.type,
      simulator: SIMULATORS.TERMINAL,
      updates: {
        terminal: {
          typedOptions: startLogsTerminalContent,
        },
      },
      waitForComplete: true,
    },
    {
      type: ANIMATION_TYPES.add_services,
      simulator: SIMULATORS.STATUS,
      updates: {
        status: {
          services: [
            {
              name: "web-app",
              namespace: "default",
              replicas: 3,
              status: STATUS.pending,
            },
          ],
        },
      },
    },
    {
      type: ANIMATION_TYPES.animate_startup,
      simulator: SIMULATORS.STATUS,
      updates: {
        serviceName: "web-app",
      },
    },
  ] as Animations,
  targetState: {
    terminal: {
      // typedOptions: ([] as string[]).concat(terminalAutoLines, userEntry, [""]),
      typedOptions: startLogsTerminalContent,
    },
    config: {
      files: {
        "deployment.yaml": {
          text: previousState.config!.files["deployment.yaml"].text,
        },
      },
      activeFile: "deployment.yaml",
    },
    status: {
      services: [
        {
          name: "web-app",
          namespace: "default",
          replicas: 3,
          status: STATUS.running,
        },
      ] as ServiceTarget[],
    },
    logs: {
      records: [],
    },
    banner: null,
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
      engineState.activeSimulator.has(SIMULATORS.CONFIG) ||
      engineState.activeSimulator.has(SIMULATORS.STATUS)
    ) {
      if (simContainerParentRef.current) {
        simContainerParentRef.current.scrollTo({ top: 0, behavior: "smooth" });
      }
    } else if (
      engineState.activeSimulator.has(SIMULATORS.TERMINAL) ||
      engineState.activeSimulator.has(SIMULATORS.LOGS)
    ) {
      if (simContainerParentRef.current) {
        simContainerParentRef.current.scrollTop =
          simContainerParentRef.current.scrollHeight;
      }
    }
  }, [engineState.activeSimulator]);

  const config = null;
  const status = null;
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
              active={engineState.activeSimulator.has(SIMULATORS.CONFIG)}
            >
              {config !== null && <ConfigText />}
            </SimulatorBox>
          </Grid>

          <Grid size={6.5}>
            <SimulatorBox
              title="Status"
              active={engineState.activeSimulator.has(SIMULATORS.STATUS)}
            >
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
                  state={engineState.currentSimulatorState.terminal}
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
              {logs !== null && <LogsSimulator />}
            </SimulatorBox>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
