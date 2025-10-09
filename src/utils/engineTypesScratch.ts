import type { FRAME_TYPES, SIMULATORS } from "./constants";
import type {
  ClearSimulatorsFrame,
  DelayFrame,
  Frame,
  TerminalTypedOptions,
} from "./types";

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
type StatusString = string;

type ActivePod = {
  id: PodId;
  name: string;
  namespace: string;
  status: StatusString;
  replicaNo: number;
  parentServiceKey: string;
  restartCount: number;
  // beingReplaced?: boolean;
  // replacing?: PodId;
};

export type ActivePodMap = Record<PodId, ActivePod>;

export interface EngineStatusTarget {
  activePods: ActivePodMap;
  podOrder: PodId[];
}

// ============================================================================
// ENGINE ANIMATION FRAMES
// ============================================================================

export namespace EngineFrames {
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

  // Union of ALL animations across all simulators
  export type Any =
    | Terminal.All
    | Status.All
    | DelayFrame
    | ClearSimulatorsFrame;
}
