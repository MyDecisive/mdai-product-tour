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
  dynamicFilterOn,
  filterOff,
  filterOn,
  initialBannerState,
} from "./bannerContent";
import { staticFilterNoCommentConfig } from "./configSamples/configContent";
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
        text: "",
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
          banner: filterOff,
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
        ...staticFilterNoCommentConfig,
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
          initialLineToggles: {
            73: true,
            74: true,
            75: true,
            76: true,
            77: true,
            78: true,
          },
        },
      }),
      createAnimationAction({}, 1500),
      createAnimationAction({
        config: {
          initialLineToggles: {
            99: true,
            100: true,
          },
        },
      }),
      createAnimationAction(
        {
          config: {
            showToggleButtons: true,
          },
        },
        1500
      ),
      // createAnimationAction({
      //   config: staticFilterConfigPartTwo,
      // }),
      // createAnimationAction({}, 2000),
      // createAnimationAction({
      //   config: staticFilterNoCommentConfig,
      // }),
      // createAnimationAction({}, 2000),
      // createAnimationAction({
      //   config: staticFilterNoCommentConfigPartTwo,
      // }),
      // createAnimationAction({}, 2000),
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
        banner: filterOn,
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
      // createAnimationAction({
      //   config: step3HubConfigPartOne,
      // }),
      // createAnimationAction({}, 2000),
      // createAnimationAction({
      //   config: step3HubConfigPartTwo,
      // }),
      // createAnimationAction({}, 2000),
      // createAnimationAction({
      //   config: step3OTelConfigPartOne,
      // }),
      // createAnimationAction({}, 2000),
      // createAnimationAction({
      //   config: step3OTelConfigPartTwo,
      // }),
    ],
  },
  [ITEM_IDS.step3_take]: {
    initialState: {
      config: {},
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
