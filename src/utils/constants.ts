export const contactUrl = `mailto:${import.meta.env.VITE_CONTACT_EMAIL}`;
export const contactAPIEndpoint = import.meta.env.VITE_CONTACT_API_URL;

export const TERMINAL_PROMPT = "eng@local-terminal > ";
export const CURSOR_CHAR = "█";

export const DEFAULT_ANIMATION_STEP_DURATION = 1500;

export const FRAME_TYPES = {
  ACTIVATE: "activate",
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
