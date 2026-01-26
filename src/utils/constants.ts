export const contactUrl = `mailto:${import.meta.env.VITE_CONTACT_EMAIL}`;
export const contactAPIEndpoint = import.meta.env.VITE_CONTACT_API_URL;
export const emailRegex =
  // eslint-disable-next-line no-control-regex
  /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;

export const TERMINAL_PROMPT = "eng@local-terminal > ";
export const CURSOR_CHAR = "█";
export const POD_NAME_DELIM = "-";

export const GROUP_ID_DELIM = "#";

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

export const LOG_LEVELS = {
  ERROR: "ERROR",
  WARN: "WARN",
  DEBUG: "DEBUG",
  INFO: "INFO",
};

export const LOG_FORMAT = {
  SERVICE: "service",
  COLLECTOR: "collector",
  JSON: "json",
  MULTILINE: "multiline",
};
