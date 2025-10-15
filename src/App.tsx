import { Box } from "@mui/material";
import { useEffect, useState } from "react";
import "./App.css";
import {
  Banner,
  Footer,
  NavDrawer,
  Simulators,
  WelcomeModal,
} from "./components";
import { BigContentModal } from "./components/BigContentModal/BigContentModal";
import { drawerWidth } from "./components/NavDrawer/NavDrawer";
import type { SubstepConfig } from "./utils/configTypesScratch";
import { FRAME_TYPES, SIMULATORS } from "./utils/constants";
import type {
  EngineFrames,
  EngineTargetState,
  TourEngine,
} from "./utils/engineTypesScratch";
import { loadAllTourConfigs } from "./utils/loadTourConfigs";
import {
  terminalAutoLines,
  userEntry,
} from "./views/Logs/terminal/terminalContent";

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

function App() {
  const [tourConfig, setTourConfig] = useState<TourEngine[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // TODO: Add navigation state here

  useEffect(() => {
    loadAllTourConfigs()
      .then(setTourConfig)
      .catch((err: unknown) => {
        const msg =
          err instanceof Error ? err.message : "Failed to load config";
        setError(msg);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading tour...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!tourConfig || tourConfig.length === 0) return null;

  const frames =
    tourConfig[0].steps[0].substeps[0].frames || ([] as EngineFrames.Any[]);
  const targetState = tourConfig[0].steps[0].substeps[0].targetState;

  return (
    <Box
      sx={{
        display: "flex",
        height: "100vh",
        width: "100%",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          display: "flex",
          width: "100vw",
          height: "100%",
          overflow: "hidden",
        }}
      >
        <WelcomeModal />
        <NavDrawer />
        <Box
          sx={{
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
            maxWidth: `calc(100% - ${drawerWidth}px)`,
          }}
        >
          <Banner />
          <Simulators
            onComplete={onComplete}
            previousState={previousState}
            frames={frames}
            targetState={targetState}
          />
        </Box>
        <BigContentModal />
      </Box>
      <Footer />
    </Box>
  );
}

export default App;
