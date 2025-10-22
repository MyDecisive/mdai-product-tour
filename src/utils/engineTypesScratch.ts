import type { ContentConfig } from "./configTypesScratch";
import type { FRAME_TYPES, SIMULATORS } from "./constants";
import type {
  ClearSimulatorsFrame,
  DelayFrame,
  Frame,
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

// ============================================================================
// ENGINE ANIMATION FRAMES
// ============================================================================

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

  export type Any =
    | Terminal.All
    | Status.All
    | DelayFrame
    | ClearSimulatorsFrame;
}
