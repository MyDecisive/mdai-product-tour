import type { TypedOptions } from "typed.js";
import type { ConfigSimScrollTarget as FrameScrolTarget } from "./frames";
import type { PodStatusType } from "./kinds";

// ============================================================================
// Simulator/Player state
// ============================================================================

// Terminal simulator
export interface TerminalTypedOptions extends TypedOptions {
  prompt?: string;
  printed: boolean;
}

interface EngineTerminalTarget {
  strings: TerminalTypedOptions[];
}

// Status simulator
export type PodId = string;

export interface ActivePod {
  id: PodId;
  name: string;
  namespace: string;
  status: PodStatusType;
  replicaNo: number;
  parentServiceKey: string;
  restartCount: number;
  isActiveLogsContext?: boolean;
}

export type ActivePodMap = Record<PodId, ActivePod>;

export interface EngineStatusTarget {
  activePods: ActivePodMap;
  podOrder: PodId[];
}

// Config simulator
export interface ConfigLine {
  lineNo: number;
  content: string;
  changeLineNo?: number;
  changeContent?: string;
}

export interface LineGroup {
  type: "group";
  groupId: string;
  start: number;
  end: number;
  lines: ConfigLine[];
  isChangeBlock: boolean;
}

interface GapLine {
  lineNo: number;
  type: "gap";
}

export type ConfigContent = LineGroup | GapLine;

export interface EngineFileConfig {
  groups: ConfigContent[];
  fileName: string;
  url: string;
  changeMap: Map<number, string>; // from createChangeMap
}

export interface EngineConfigSimScrollTarget extends FrameScrolTarget {
  id: string;
  groupId: string;
}

interface EngineConfigTarget {
  files: Record<EngineFileConfig["fileName"], EngineFileConfig>;
  activeTab: string;
  showingToggle: Set<LineGroup["groupId"]>;
  showingChange: Set<LineGroup["groupId"]>;
  pulsedGroups: Set<LineGroup["groupId"]>;
  activeScrollTarget?: EngineConfigSimScrollTarget;
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

export interface EngineLogsContext {
  records: LogRecord[];
  speed: number;
  contextName: string;
}

interface EngineLogsTarget {
  activeContext: string;
  allContexts: Record<string, EngineLogsContext>;
}

interface BannerTargetState {
  text: string;
  logsSent: number;
  logsFiltered: number;
}

export interface EngineTargetState {
  terminal?: EngineTerminalTarget;
  status?: EngineStatusTarget;
  config?: EngineConfigTarget;
  logs?: EngineLogsTarget;
  banner?: BannerTargetState;
}
