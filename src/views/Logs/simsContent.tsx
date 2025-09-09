import type {
  AnimationAction,
  SimScript,
  SimulatorPanelState,
  StepDefinitions,
} from "../../utils/types";
import {
  createEmptySimulatorPanelState,
  DEFAULT_ANIMATION_STEP_DURATION,
  ITEM_IDS,
  TERMINAL_PROMPT,
} from "../common";
import mdaiHubSample from "../Logs/configSamples/mdaiHubSample.yaml?raw";
import otelSample from "../Logs/configSamples/otelSample.yaml?raw";

export const LOGS_SIMS: Record<string, SimScript> = {
  [ITEM_IDS.step1_visualize]: [
    {
      simType: "config.show",
      configFile: otelSample,
      configName: "otel-collector.yaml",
      href: "https://github.com/DecisiveAI/mdai-labs/blob/main/otel/otel_ref.yaml",
      range: { start: 73, end: 79 },
    },
    { simType: "status.set", text: "Collector configured…", delay: 300 },
    {
      simType: "terminal.run",
      cmd: "kubectl get pods -n observability",
      delay: 300,
    },
    {
      simType: "terminal.out",
      text: "collector-abc123   Running\nloki-0   Running\npromtail-xyz   Ready",
      delay: 250,
    },
    {
      simType: "logs.append",
      lines: ["… received 125 spans", "… exporting to mdai-hub"],
      delay: 300,
    },
  ],
  [ITEM_IDS.step2_configure]: [
    {
      simType: "config.show",
      configFile: mdaiHubSample,
      configName: "mdai-hub.yaml",
      href: "https://github.com/DecisiveAI/mdai-labs/blob/main/mdai/hub/hub_ref.yaml",
      range: { start: 80, end: 92 },
    },
    {
      simType: "terminal.run",
      cmd: "mdai hub apply -f config.yaml",
      delay: 250,
    },
    { simType: "terminal.out", text: "Applied. Version: 1.2.3", delay: 200 },
    {
      simType: "status.set",
      text: ["Hub connected", "PII scrubber active", "Replay disabled"],
      delay: 250,
    },
    {
      simType: "logs.append",
      lines: ["policy: pii.scrub enabled", "sink: mdai-cloud up"],
      delay: 250,
    },
  ],
};

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
  [ITEM_IDS.introduction_what]: {
    initialState: createEmptySimulatorPanelState(),
    animations: [],
  },
  [ITEM_IDS.introduction_unified]: {
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
        logs: [],
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
          terminal: { active: true },
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
};
