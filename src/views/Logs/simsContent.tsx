import {
  CURSOR_CHAR,
  DEFAULT_ANIMATION_STEP_DURATION,
  ITEM_IDS,
  TERMINAL_PROMPT,
} from "../../utils/constants";
import type {
  AnimationAction,
  LogRecord,
  // Service,
  SimulatorPanelState,
  StepDefinitions,
  TerminalTypedOptions,
} from "../../utils/types";
import { createEmptySimulatorPanelState } from "../allViewsPanelContent";
// import mdaiHubSample from "../Logs/configSamples/mdaiHubSample.yaml?raw";
// import otelSample from "../Logs/configSamples/otelSample.yaml?raw";

const terminalAutoLines = [
  "<br/>",
  "<br/>",
  "^700🧪 Deploying synthetic log generators...^450",
  "deployment.apps/mdai-logger-xnoisy created",
  "deployment.apps/mdai-logger-noisy created^450",
  "deployment.apps/mdai-logger created",
  "✅ Log generators deployed",
];

const userEntry = [
  // "./MDAI-kind",
  // "./mdai-kind .sh",
  // "./mdai-kind.sh kif",
  "./mdai-kind.sh logs",
];

const sampleLogs: LogRecord[] = [
  { message: "Application started successfully" },
  { message: "Database connection established" },
  { message: "Loading configuration from /etc/app/config.yaml" },
  { message: "Starting HTTP server on port 8080" },
  { message: "Processing incoming request GET /api/users" },
  { message: "Query executed in 23ms" },
  { message: "Response sent with status 200" },
  { message: "Cache hit for key: user_123" },
  { message: "Background job scheduled: data-cleanup" },
  { message: "Memory usage: 245MB / 512MB" },
  { message: "Processing batch job with 150 items" },
  { message: "Health check passed" },
];

const errorLogs: LogRecord[] = [
  { message: "Failed to connect to external API", level: "error" },
  { message: "Database query timeout after 30s", level: "error" },
  { message: "Invalid JSON in request body", level: "error" },
  { message: "Rate limit exceeded for client 192.168.1.100", level: "warn" },
];

const terminalTypedOptions: TerminalTypedOptions[] = [
  {
    prompt: TERMINAL_PROMPT,
    strings: userEntry,
    typeSpeed: 70,
    backSpeed: 150,
    cursorChar: CURSOR_CHAR,
    showCursor: true,
  },
  ...(terminalAutoLines.map((line) => ({
    strings: [line],
    startDelay: 500,
    typeSpeed: 5,
    cursorChar: CURSOR_CHAR,
    showCursor: true,
    contentType: "html",
  })) as TerminalTypedOptions[]),
  {
    prompt: TERMINAL_PROMPT,
    strings: [""],
    typeSpeed: 70,
    backSpeed: 150,
    cursorChar: CURSOR_CHAR,
    showCursor: true,
  },
];

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
            typedOptions: terminalTypedOptions,
          },
        }
        // DEFAULT_ANIMATION_STEP_DURATION
      ),
      createAnimationAction(
        {
          config: { active: false },
          status: { active: true },
        },
        DEFAULT_ANIMATION_STEP_DURATION
      ),
      // createAnimationAction({
      //   terminal: { typedOptions: terminalTypedOptions },
      // }),
      createAnimationAction(
        {
          config: { active: false },
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
        {
          logs: {
            active: true,
            logRecords: sampleLogs,
            speed: 500,
            errorLogs: errorLogs,
            errorFrequency: 0.15,
            isPaused: false,
          },
        },
        10000
      ),
      createAnimationAction({
        logs: {
          active: false,
          isPaused: true,
        },
      }),
    ],
  },
};

// const services: Service[] = [
//   { name: "web-server", replicas: 2 },
//   { name: "api-gateway" },
//   { name: "mdai-operator" },
//   { name: "otel-controller", replicas: 3 },
//   { name: "random-service" },
//   { name: "database" },
// ];
