import type { TypedOptions } from "typed.js";
import type { PodStatus } from "./kinds";

// ============================================================================
// Simulator/Player state
// ============================================================================

// Terminal simulator
export interface TerminalTypedOptions extends TypedOptions {
  prompt?: string;
  printed: boolean;
}

interface Terminal {
  strings: TerminalTypedOptions[];
}

// Status simulator
export type PodId = string;

export interface ActivePod {
  id: PodId;
  name: string;
  namespace: string;
  status: PodStatus;
  replicaNo: number;
  parentServiceKey: string;
  restartCount: number;
  isActiveLogsContext?: boolean;
}

export type ActivePods = Record<PodId, ActivePod>;

interface Status {
  activePods: ActivePods;
  podOrder: PodId[];
}

// Config simulator
export interface Line {
  lineNo: number;
  content: string;
  changeLineNo?: number;
  changeContent?: string;
}

export interface LineGroup {
  kind: "group";
  groupId: string;
  start: number;
  end: number;
  lines: Line[];
  isChangeBlock: boolean;
}

interface GapLine {
  lineNo: number;
  kind: "gap";
}

export type ConfigContent = LineGroup | GapLine;

export interface ConfigFile {
  groups: ConfigContent[];
  fileName: string;
  url: string;
  changeMap: Map<number, string>; // from createChangeMap
}

export interface ScrollTarget {
  fileName: string;
  line: number;
  scrollOnly?: boolean;
}

export interface ActiveScrollTarget extends ScrollTarget {
  id: string;
  groupId: string;
}

interface Config {
  files: Record<ConfigFile["fileName"], ConfigFile>;
  activeTab: string;
  showingToggle: Set<LineGroup["groupId"]>;
  showingChange: Set<LineGroup["groupId"]>;
  pulsedGroups: Set<LineGroup["groupId"]>;
  activeScrollTarget?: ActiveScrollTarget;
}

// Logs simulator
export interface LogRecord {
  message?: string;
  content?: string;
  level?: string;
  timestamp?: string;
  id?: string;
  [key: string]: unknown;
}

export interface LogsContext {
  records: LogRecord[];
  speed: number;
  contextName: string;
}

interface Logs {
  activeContext: string;
  allContexts: Record<string, LogsContext>;
}

interface Banner {
  text: string;
  logsSent: number;
  logsFiltered: number;
}

export interface Player {
  terminal?: Terminal;
  status?: Status;
  config?: Config;
  logs?: Logs;
  banner?: Banner;
}
