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
export const ANIMATION_TYPES = {
  type: "type",
  enter_command: "enter_command",
  clear: "clear",
  switch_file: "switch_file",
  scroll_to: "scroll_to",
  highlight_lines: "highlight_lines",
  toggle_line: "toggle_line",
  add_services: "add_services",
  update_service: "update_service",
  animate_startup: "animate_startup",
  add: "add",
  stream: "stream",
  pause: "pause",
  resume: "resume",
  update: "update",
  delay: "delay",
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
