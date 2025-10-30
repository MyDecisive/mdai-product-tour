import { Box } from "@mui/material";
import { transformStatus } from "./animationEngine/configToEngineTransforms";
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
import { createChangeMap } from "./hooks/useGetConfigSimulatorContent/utils";
import { FRAME_TYPES, SIMULATORS } from "./utils/constants";
import type {
  EngineFrames,
  EngineTargetState,
} from "./utils/engineTypesScratch";
import {
  staticFilterNoCommentChanges,
  staticFilterNoCommentConfigContentGroups,
} from "./views/Logs/configSamples/configContent";
import { serviceLogs } from "./views/Logs/tailLogs/tailLogsContent";
import { startLogsTerminalContent } from "./views/Logs/terminal/terminalContent";

/** hard coded stuff for dev */
const previousState: EngineTargetState = {
  terminal: {
    strings: [],
  },
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
    },
    podOrder: ["web-app-default^1@0", "web-app-default^2@0"],
  },
};

const frames: EngineFrames.Any[] = [
  {
    type: FRAME_TYPES.add,
    simulator: SIMULATORS.LOGS,
    updates: {
      records: serviceLogs.map((log, index) => ({
        ...log,
        timestamp: new Date().toISOString(),
        id: `log-message-${index}`,
      })),
    },
  },
  {
    type: FRAME_TYPES.enter_command,
    simulator: SIMULATORS.TERMINAL,
    updates: {
      strings: startLogsTerminalContent,
    },
    waitForComplete: true,
  },
  {
    type: FRAME_TYPES.add_services,
    simulator: SIMULATORS.STATUS,
    updates: transformStatus(
      [
        {
          name: "web-app",
          namespace: "default",
          replicas: 2,
        },
      ],
      "this-step"
    ),
    waitForComplete: true,
  },
  {
    type: FRAME_TYPES.add,
    simulator: SIMULATORS.CONFIG,
    updates: {
      files: {
        "otel_ref.yaml": {
          url: "https://github.com/DecisiveAI/mdai-labs/blob/main/otel/otel_ref.yaml",
          fileName: "otel_ref.yaml",
          changeMap: createChangeMap(staticFilterNoCommentChanges),
          groups: staticFilterNoCommentConfigContentGroups,
        },
      },
      showingToggle: new Set<string>(),
      showingChange: staticFilterNoCommentConfigContentGroups.reduce(
        (accum, group) => {
          if (group.type === "group" && group.isChangeBlock) {
            accum.add(group.groupId);
          }
          return accum;
        },
        new Set<string>()
      ),
      activeTab: "otel_ref.yaml",
    },
    waitForComplete: false,
  },
  {
    type: FRAME_TYPES.delay,
    duration: 1000,
    waitForComplete: true,
  },
  {
    type: FRAME_TYPES.scroll_to,
    simulator: SIMULATORS.CONFIG,
    updates: {
      fileName: "otel_ref.yaml",
      line: 74,
    },
    waitForComplete: true,
  },
  {
    type: FRAME_TYPES.scroll_to,
    simulator: SIMULATORS.CONFIG,
    updates: {
      fileName: "otel_ref.yaml",
      line: 100,
    },
    waitForComplete: true,
  },
];
const targetState: EngineTargetState = {
  terminal: {
    strings: startLogsTerminalContent,
  },
  config: {
    files: {
      "otel_ref.yaml": {
        url: "https://github.com/DecisiveAI/mdai-labs/blob/main/otel/otel_ref.yaml",
        fileName: "otel_ref.yaml",
        changeMap: createChangeMap(staticFilterNoCommentChanges),
        groups: staticFilterNoCommentConfigContentGroups,
      },
    },
    showingToggle: new Set<string>([
      "otel_ref.yaml-95-102",
      "otel_ref.yaml-73-78",
    ]),
    showingChange: new Set<string>(),
    activeTab: "otel_ref.yaml",
  },
  status: transformStatus(
    [
      {
        name: "web-app",
        namespace: "default",
        replicas: 2,
      },
    ],
    "this-step",
    true
  ),
};
/** end hard coded dev stuff */

function onComplete() {
  // TODO: This would enable the "next" button in the nav
  console.log("animation complete!!");
}

function App() {
  // const [tourConfig, setTourConfig] = useState<TourEngine[] | null>(null);
  // const [loading, setLoading] = useState(true);
  // const [error, setError] = useState<string | null>(null);

  // // TODO: Add navigation state here

  // useEffect(() => {
  //   loadAllTourConfigs()
  //     .then(setTourConfig)
  //     .catch((err: unknown) => {
  //       const msg =
  //         err instanceof Error ? err.message : "Failed to load config";
  //       setError(msg);
  //     })
  //     .finally(() => setLoading(false));
  // }, []);

  // if (loading) return <div>Loading tour...</div>;
  // if (error) return <div>Error: {error}</div>;
  // if (!tourConfig || tourConfig.length === 0) return null;

  // const frames =
  //   tourConfig[0].steps[0].substeps[0].frames || ([] as EngineFrames.Any[]);
  // const targetState = tourConfig[0].steps[0].substeps[0].targetState;

  // const parsedConfig = parseYaml(tours);
  // console.log("parsedConfig", parsedConfig);

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
