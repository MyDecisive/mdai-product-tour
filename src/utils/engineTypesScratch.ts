import type { TerminalTypedOptions } from "./types";

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
  // skipStartup?: boolean;
  replicaNo: number;
  // parentServiceKey: string;
  // beingReplaced?: boolean;
  // replacing?: PodId;
};

export type ActivePodMap = Record<PodId, ActivePod>;

export interface EngineStatusTarget {
  activePods: ActivePodMap;
  podOrder: PodId[];
}
