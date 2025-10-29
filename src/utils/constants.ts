import type { AnimationState, NavigationState, TourState, View } from "./types";

export const Logs: View = "Logs";
export const Traces: View = "Traces";
export const PII: View = "PII";
export const Home: View = "Home";

export const contactUrl = `mailto:${import.meta.env.VITE_CONTACT_EMAIL}`;
export const contactAPIEndpoint = import.meta.env.VITE_CONTACT_API_URL;

export const ITEM_IDS = {
  introduction: "introduction",
  step1: "step1",
  step2: "step2",
  step3: "step3",
  introduction_meet: "introduction_meet",
  introduction_guide: "introduction_guide",
  introduction_consolidated: "introduction_consolidated",
  step1_data: "step1_data",
  step1_results: "step1_results",
  step2_configure: "step2_configure",
  step2_take: "step2_take",
  step2_explore: "step2_explore",
  step2_visualize: "step2_visualize",
  step3_add: "step3_add",
  step3_take: "step3_take",
  step3_vizualize: "step3_vizualize",
  Logs,
  Traces,
  PII,
} as const;

export const TERMINAL_PROMPT = "eng@local-terminal > ";
export const CURSOR_CHAR = "█";

export const DEFAULT_ANIMATION_STEP_DURATION = 1500;

export const LOGS_DEFAULT_STEPS: NavigationState = {
  view: Logs,
  step: ITEM_IDS.introduction,
  subStep: ITEM_IDS.introduction_meet,
};

const DEFAULT_NAV_STATE: NavigationState = {
  view: Home,
  step: Logs,
};

const DEFAULT_ANIMATION_INDEX: AnimationState = -1;

export const DEFAULT_TOUR_STATE: TourState = {
  navigation: DEFAULT_NAV_STATE,
  animationIndex: DEFAULT_ANIMATION_INDEX,
};

// new stuff below
export const FRAME_TYPES = {
  TYPE: "type",
  ENTER_COMMAND: "enter_command",
  CLEAR: "clear",
  SWITCH_FILE: "switch_file",
  SCROLL_TO: "scroll_to",
  HIGHLIGHT_LINES: "highlight_lines",
  TOGGLE_LINE: "toggle_line",
  ADD_SERVICES: "add_services",
  UPDATE_SERVICE: "update_service",
  ANIMATE_STARTUP: "animate_startup",
  ADD: "add",
  STREAM: "stream",
  PAUSE: "pause",
  RESUME: "resume",
  UPDATE: "update",
  DELAY: "delay",
} as const;

export const SIMULATORS = {
  BANNER: "banner",
  TERMINAL: "terminal",
  LOGS: "logs",
  STATUS: "status",
  CONFIG: "config",
} as const;

const pending = "Pending";
const containerCreating = "ContainerCreating";
const running = "Running";
const error = "Error";
const crashLoopBackoff = "CashLoopBackoff";
const terminating = "Terminating";
const shutdown = "Shutdown";

export const STATUS = {
  pending,
  containerCreating,
  running,
  error,
  crashLoopBackoff,
  terminating,
  shutdown,
} as const;
