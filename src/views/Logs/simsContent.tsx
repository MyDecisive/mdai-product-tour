import {
  DEFAULT_ANIMATION_STEP_DURATION,
  ITEM_IDS,
  TERMINAL_PROMPT,
} from "../../utils/constants";
import type {
  AnimationAction,
  SimulatorPanelState,
  StepDefinitions,
} from "../../utils/types";
import { createEmptySimulatorPanelState } from "../allViewsPanelContent";
import {
  staticFilterConfig,
  staticFilterConfigPartTwo,
  staticFilterNoCommentConfig,
  step3HubConfigPartOne,
  step3HubConfigPartTwo,
  step3OTelConfigPartOne,
  step3OTelConfigPartTwo,
} from "./configSamples/configContent";
import {
  fluentDServices,
  logGenServices,
  startingServices,
  step2StartingSvcs,
  step2UpdateSvcs,
} from "./servicesContent";
import { braidedLogs, collectorLogs } from "./tailLogs/tailLogsContent";
import {
  applyConfigTerminalContent,
  portForwardTerminalContent,
  startLogsTerminalContent,
} from "./terminal/terminalContent";
// import mdaiHubSample from "../Logs/configSamples/mdaiHubSample.yaml?raw";
// import otelSample from "../Logs/configSamples/otelSample.yaml?raw";

function createAnimationAction(
  stateChanges: Partial<SimulatorPanelState>,
  delay?: number
): AnimationAction {
  return {
    type: delay !== undefined ? "delay" : "state_update",
    stateChanges,
    delay,
  };
}

export const PANEL_STATE: StepDefinitions = {
  [ITEM_IDS.introduction_meet]: {
    initialState: createEmptySimulatorPanelState(),
    animations: [],
  },
  [ITEM_IDS.introduction_consolidated]: {
    initialState: {
      config: {
        text: "",
      },
      terminal: {
        typedOptions: [
          {
            prompt: TERMINAL_PROMPT,
            showCursor: false,
            strings: [""],
          },
        ],
      },
      status: {
        services: [],
      },
      logs: {
        logRecords: [],
        isPaused: true,
      },
    },
    animations: [
      createAnimationAction(
        { config: { active: true } },
        DEFAULT_ANIMATION_STEP_DURATION
      ),
      createAnimationAction(
        {
          config: { active: false },
          terminal: {
            active: true,
          },
        },
        DEFAULT_ANIMATION_STEP_DURATION
      ),
      createAnimationAction(
        {
          config: { active: false },
          terminal: { active: false },
          status: { active: true },
        },
        DEFAULT_ANIMATION_STEP_DURATION
      ),
      createAnimationAction(
        {
          config: { active: false },
          status: { active: false },
          terminal: { active: false },
          logs: { active: true },
        },
        DEFAULT_ANIMATION_STEP_DURATION
      ),
      createAnimationAction(
        { logs: { active: false } },
        DEFAULT_ANIMATION_STEP_DURATION
      ),
    ],
  },
  [ITEM_IDS.step1_data]: {
    initialState: {
      config: {
        text: "",
      },
      terminal: {
        typedOptions: [
          {
            prompt: TERMINAL_PROMPT,
            showCursor: false,
            strings: [""],
          },
        ],
      },
      status: {
        contextLabel: "NAMESPACE: mdai",
        services: startingServices,
      },
      logs: {
        logRecords: [],
        isPaused: true,
      },
    },
    animations: [
      createAnimationAction({
        terminal: {
          active: true,
          typedOptions: startLogsTerminalContent,
        },
      }),
      createAnimationAction({
        terminal: {
          active: false,
        },
        status: {
          active: true,
          services: logGenServices,
        },
      }),
      createAnimationAction(
        {
          status: { active: false },
          logs: {
            contextLabel: logGenServices.map((svc) => svc.name).join(" - "),
            active: true,
            logRecords: braidedLogs,
            speed: 50,
            isPaused: false,
          },
        },
        5000
      ),
      createAnimationAction({
        logs: {
          active: false,
          isPaused: true,
        },
        terminal: {
          active: true,
          typedOptions: portForwardTerminalContent,
        },
      }),
      createAnimationAction({
        terminal: {
          active: false,
        },
        status: {
          active: true,
          services: fluentDServices,
          contextLabel: "NAMESPACE: default",
        },
      }),
      createAnimationAction(
        {
          status: {
            active: false,
          },
          logs: {
            active: true,
            isPaused: false,
            contextLabel: fluentDServices.map((svc) => svc.name).join(" - "),
          },
        },
        5000
      ),
      createAnimationAction({
        logs: {
          active: false,
          isPaused: true,
        },
      }),
    ],
  },
  [ITEM_IDS.step2_configure]: {
    initialState: {
      config: {
        active: true,
      },
      terminal: {
        typedOptions: [
          {
            prompt: TERMINAL_PROMPT,
            showCursor: false,
            strings: [""],
          },
        ],
      },
      status: {
        contextLabel: "NAMESPACE: mdai",
        services: step2StartingSvcs,
      },
      logs: {
        logRecords: [],
        isPaused: true,
      },
    },
    animations: [
      createAnimationAction({
        config: staticFilterConfig,
      }),
      createAnimationAction({}, 2000),
      createAnimationAction({
        config: staticFilterConfigPartTwo,
      }),
      createAnimationAction({}, 2000),
      createAnimationAction({
        config: staticFilterNoCommentConfig,
      }),
      createAnimationAction({}, 2000),
      createAnimationAction({
        config: staticFilterConfigPartTwo,
      }),
      createAnimationAction({}, 2000),
      createAnimationAction({
        config: {
          active: false,
        },
        terminal: {
          active: true,
          typedOptions: applyConfigTerminalContent,
        },
      }),
      createAnimationAction({
        terminal: {
          active: false,
        },
        status: {
          active: true,
          services: step2UpdateSvcs,
        },
      }),
      createAnimationAction({
        status: {
          active: false,
        },
        logs: {
          logRecords: collectorLogs,
        },
      }),
    ],
  },
  [ITEM_IDS.step3_add]: {
    initialState: {
      config: {
        active: true,
      },
      terminal: {
        typedOptions: [
          {
            prompt: TERMINAL_PROMPT,
            showCursor: false,
            strings: [""],
          },
        ],
      },
      status: {
        services: [],
      },
      logs: {
        logRecords: [],
        isPaused: true,
      },
    },
    animations: [
      createAnimationAction({
        config: step3HubConfigPartOne,
      }),
      createAnimationAction({}, 2000),
      createAnimationAction({
        config: step3HubConfigPartTwo,
      }),
      createAnimationAction({}, 2000),
      createAnimationAction({
        config: step3OTelConfigPartOne,
      }),
      createAnimationAction({}, 2000),
      createAnimationAction({
        config: step3OTelConfigPartTwo,
      }),
    ],
  },
};
