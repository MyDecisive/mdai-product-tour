import type { ContentConfig } from "./configTypesScratch";
import type { FRAME_TYPES, SIMULATORS } from "./constants";
import type {
  ClearSimulatorsFrame,
  DelayFrame,
  Frame,
  LogRecord,
  PodStatusType,
  TerminalTypedOptions,
} from "./types";

// ============================================================================
// TOUR ENGINE STRUCTURE
// ============================================================================

export interface TourEngine {
  id: string;
  version: string;
  title: string;
  description?: string;
  steps: EngineStep[];
}

interface EngineStep {
  id: string;
  label: string;
  substeps: EngineSubstep[];
}

export interface EngineSubstep {
  id: string;
  label: string;
  subLabel?: string;
  content: ContentConfig;
  targetState: EngineTargetState;
  frames?: EngineFrames.Any[];
}

// ============================================================================
// ENGINE TARGET STATES
// ============================================================================

export interface EngineTargetState {
  terminal?: EngineTerminalTarget;
  status?: EngineStatusTarget;
  config?: EngineConfigTarget;
  logs?: EngineLogsTarget;
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

export interface EngineConfigTarget {
  files: Record<string, EngineFileConfig>;
  activeTab: string;
  showingToggle: Set<string>; // groupIds
  showingChange: Set<string>; // groupIds
}

// ----------------------------------------------------------------------------
// Logs
// ----------------------------------------------------------------------------

export interface EngineLogsTarget {
  records: LogRecord[];
  speed: number;
  errorRecords: LogRecord[];
  errorFrequency: number;
}

// ============================================================================
// ENGINE ANIMATION FRAMES
// ============================================================================
// TODO: Explore a DRYer way to declare these and the correllaries for the Tour configuration
export declare namespace EngineFrames {
  export namespace Terminal {
    export type EnterCommand = Frame<
      typeof SIMULATORS.TERMINAL,
      typeof FRAME_TYPES.enter_command,
      EngineTerminalTarget
    >;
    export type All = EnterCommand;
  }

  export namespace Status {
    export type AddServices = Frame<
      typeof SIMULATORS.STATUS,
      typeof FRAME_TYPES.add_services,
      EngineStatusTarget
    >;
    export type All = AddServices;
  }

  export namespace Config {
    export type Add = Frame<
      typeof SIMULATORS.CONFIG,
      typeof FRAME_TYPES.add,
      EngineConfigTarget
    >;
    export type ScrollTo = Frame<
      typeof SIMULATORS.CONFIG,
      typeof FRAME_TYPES.scroll_to,
      {
        fileName: string;
        line: number;
      }
    >;
    export type ALL = Add | ScrollTo;
  }

  export namespace Logs {
    export type Add = Frame<
      typeof SIMULATORS.LOGS,
      typeof FRAME_TYPES.add,
      EngineLogsTarget
    >;
    export type Stream = Frame<
      typeof SIMULATORS.LOGS,
      typeof FRAME_TYPES.stream,
      EngineLogsTarget
    >;
    export type Pause = Frame<typeof SIMULATORS.LOGS, typeof FRAME_TYPES.pause>;
    export type Resume = Frame<
      typeof SIMULATORS.LOGS,
      typeof FRAME_TYPES.resume,
      EngineLogsTarget
    >;
    export type All = Add | Stream | Pause | Resume;
  }

  export type Any =
    | Terminal.All
    | Status.All
    | Logs.All
    | Config.ALL
    | DelayFrame
    | ClearSimulatorsFrame;
}
