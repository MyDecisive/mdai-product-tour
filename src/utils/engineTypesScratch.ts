import type {
  BannerTargetState,
  ConfigSimScrollTarget,
  ContentItem,
  EngineFrames,
  LogRecord,
  NavigationState,
  PodStatusType,
  TerminalTypedOptions,
  VisualizationContentItem,
} from "./types";

// ============================================================================
// TOUR ENGINE STRUCTURE
// ============================================================================

export interface TourEngine {
  id: string;
  version: string;
  title: string;
  subtitle?: string;
  description?: string;
  coming_soon?: boolean;
  buttonText?: string;
  steps: EngineStep[];
  default_open?: boolean;
}

export interface EngineStep {
  id: string;
  title?: string;
  subSteps: EngineSubStep[];
}

export interface EngineSubStep {
  id: string;
  title?: string;
  content?: EngineContentBlock[];
  visualizationModal?: boolean;
  initialState?: EngineTargetState;
  animation?: EngineFrames["Any"][];
  targetState?: EngineTargetState;
  previousSubStep: NavigationState;
  nextSubStep: NavigationState;
}

export interface EngineContentBlock {
  title?: string;
  variant?: "default" | "list";
  items: (EngineContentItem | VisualizationContentItem)[];
}

export interface EngineContentItem extends ContentItem {
  actions?: EngineFrames["Any"][];
  onClick?: EngineFrames["Any"]; // Item-level click handler
}

// ============================================================================
// ENGINE TARGET STATES
// ============================================================================

export interface EngineTargetState {
  terminal?: EngineTerminalTarget;
  status?: EngineStatusTarget;
  config?: EngineConfigTarget;
  logs?: EngineLogsTarget;
  banner?: BannerTargetState;
}

// ----------------------------------------------------------------------------
// TERMINAL
// ----------------------------------------------------------------------------
export interface EngineTerminalTarget {
  strings: TerminalTypedOptions[];
}

// ----------------------------------------------------------------------------
// STATUS
// ----------------------------------------------------------------------------
export type PodId = string;

export interface ActivePod {
  id: PodId;
  name: string;
  namespace: string;
  status: PodStatusType;
  replicaNo: number;
  parentServiceKey: string;
  restartCount: number;
}

export type ActivePodMap = Record<PodId, ActivePod>;

export interface EngineStatusTarget {
  activePods: ActivePodMap;
  podOrder: PodId[];
}

// ----------------------------------------------------------------------------
// Config
// ----------------------------------------------------------------------------

export type ConfigLine = {
  lineNo: number;
  content: string;
  changeLineNo?: number;
  changeContent?: string;
};

export type LineGroup = {
  type: "group";
  groupId: string;
  start: number;
  end: number;
  lines: ConfigLine[];
  isChangeBlock: boolean;
};

type GapLine = {
  lineNo: number;
  type: "gap";
};

export type ConfigContent = LineGroup | GapLine;

export interface EngineFileConfig {
  groups: ConfigContent[];
  fileName: string;
  url: string;
  changeMap: Map<number, string>; // from createChangeMap
}

export interface EngineConfigSimScrollTarget extends ConfigSimScrollTarget {
  id: string;
  groupId: string;
}

export interface EngineConfigTarget {
  files: Record<string, EngineFileConfig>;
  activeTab: string;
  showingToggle: Set<string>; // groupIds
  showingChange: Set<string>; // groupIds
  pulsedGroups: Set<string>; // groupIds
  activeScrollTarget?: EngineConfigSimScrollTarget;
}

// ----------------------------------------------------------------------------
// Logs
// ----------------------------------------------------------------------------

export interface EngineLogsContext {
  records: LogRecord[];
  speed: number;
  contextName: string;
}

export interface EngineLogsTarget {
  activeContext: string;
  allContexts: Record<string, EngineLogsContext>;
}
