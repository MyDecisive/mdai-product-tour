import {
  DEFAULT_ANIMATION_STEP_DURATION,
  ITEM_IDS,
  TERMINAL_PROMPT,
} from "../../utils/constants";
import type {
  AnimationAction,
  DeepPartial,
  SimulatorPanelState,
  StepDefinitions,
} from "../../utils/types";
import { createEmptySimulatorPanelState } from "../allViewsPanelContent";
import {
  dynamicFilterOn,
  filterOff,
  filterOn,
  initialBannerState,
} from "./bannerContent";
import {
  buildInitialToggles,
  staticFilterNoCommentConfig,
  step3HubConfig,
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

function createAnimationAction(
  stateChanges: DeepPartial<SimulatorPanelState>,
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
        files: {},
      },
      terminal: {
        typedOptions: [
          {
            prompt: TERMINAL_PROMPT,
            showCursor: false,
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
      banner: initialBannerState,
    },
    animations: [
      createAnimationAction(
        { config: { active: true, files: {} } },
        DEFAULT_ANIMATION_STEP_DURATION
      ),
      createAnimationAction(
        {
          config: { active: false, files: {} },
          terminal: {
            active: true,
          },
        },
        DEFAULT_ANIMATION_STEP_DURATION
      ),
      createAnimationAction(
        {
          terminal: { active: false },
          status: { active: true },
        },
        DEFAULT_ANIMATION_STEP_DURATION
      ),
      createAnimationAction(
        {
          status: { active: false },
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
        files: {},
      },
      terminal: {
        typedOptions: [
          {
            prompt: TERMINAL_PROMPT,
            showCursor: false,
          },
        ],
      },
      status: {
        services: startingServices,
      },
      logs: {
        logRecords: [],
        isPaused: true,
      },
      banner: initialBannerState,
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
        },
      }),
      createAnimationAction(
        {
          status: {
            active: false,
          },
          logs: {
            active: true,
            logRecords: braidedLogs,
            speed: 50,
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
      config: staticFilterNoCommentConfig,
      terminal: {
        typedOptions: [
          {
            prompt: TERMINAL_PROMPT,
            showCursor: false,
          },
        ],
      },
      status: {
        services: step2StartingSvcs,
      },
      logs: {
        logRecords: [],
        isPaused: true,
      },
      banner: filterOff,
    },
    animations: [
      createAnimationAction({
        config: {
          active: true,
          files: {
            ["otel_ref.yaml"]: {
              initialLineToggles: buildInitialToggles(73, 78),
            },
          },
        },
      }),
      createAnimationAction({}, 1500),
      createAnimationAction({
        config: {
          files: {
            ["otel_ref.yaml"]: {
              initialLineToggles: buildInitialToggles(99, 100),
            },
          },
        },
      }),
      createAnimationAction(
        {
          config: {
            files: {
              ["otel_ref.yaml"]: {
                showToggleButtons: true,
              },
            },
          },
        },
        1500
      ),
      createAnimationAction({
        config: {
          active: false,
          files: {},
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
        banner: filterOn,
      }),
    ],
  },
  [ITEM_IDS.step3_add]: {
    initialState: {
      config: step3HubConfig,
      terminal: {
        typedOptions: [
          {
            prompt: TERMINAL_PROMPT,
            showCursor: false,
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
      banner: filterOn,
    },
    animations: [
      createAnimationAction({
        config: {
          active: true,
          files: {
            ["hub_ref.yaml"]: {
              initialLineToggles: buildInitialToggles(11, 17),
            },
          },
        },
      }),
      createAnimationAction({}, 1500),
      createAnimationAction({
        config: {
          files: {
            ["hub_ref.yaml"]: {
              initialLineToggles: buildInitialToggles(43, 47),
            },
          },
        },
      }),
      createAnimationAction({}, 1500),
      createAnimationAction({
        config: {
          files: {
            ["hub_ref.yaml"]: {
              initialLineToggles: buildInitialToggles(81, 86),
            },
          },
        },
      }),
      createAnimationAction(
        {
          config: {
            activeFileTitle: "otel_ref.yaml",
          },
        },
        750
      ),
      createAnimationAction({
        config: {
          files: {
            ["otel_ref.yaml"]: {
              initialLineToggles: buildInitialToggles(73, 77),
            },
          },
        },
      }),
      createAnimationAction({}, 1500),
      createAnimationAction({
        config: {
          files: {
            ["otel_ref.yaml"]: {
              initialLineToggles: buildInitialToggles(99, 99),
            },
          },
        },
      }),
    ],
  },
  [ITEM_IDS.step3_take]: {
    initialState: {
      config: step3HubConfig,
      terminal: {
        typedOptions: [
          {
            prompt: TERMINAL_PROMPT,
            showCursor: false,
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
      banner: dynamicFilterOn,
    },
    animations: [],
  },
};
