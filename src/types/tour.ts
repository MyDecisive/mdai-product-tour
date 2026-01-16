import { FRAME_TYPES, SIMULATORS } from "../utils/constants";
import type * as Frames from "./frames";
import type * as Kinds from "./kinds";
import type { EngineTargetState } from "./player";
import type * as Steps from "./steps";

// ============================================================================
// Simulator/Player state
// ============================================================================

// Terminal simulator
export interface TourTerminalTarget {
  input: string;
  outputs?: string[];
}

// Status simulator
/**
 * namespace - defaults to "default"
 * replicas - defaults to 1
 * noSuffix - defaults to false
 */
export interface TourStatusTarget {
  name: string;
  namespace?: string;
  replicas?: number;
  noSuffix?: boolean;
}

// Config simulator
export interface LineChangeBlock {
  start: number;
  end?: number;
  changeLines: string[];
}

interface TourFileTarget {
  url: string;
  fileName?: string;
  changes?: LineChangeBlock[];
}

export interface TourConfigSimTarget {
  files: TourFileTarget[];
  activeTab?: string; // defaults to first file
}

// Logs simulator
/**
 * logsSources - file names for local files which must be located in public/logs/
 * speed - defaults to 1000
 * contextName - the name of the Service these logs represent
 */
export interface TourLogsSimTarget {
  logsSources?: string[];
  speed?: number;
  contextName: string;
}

/**
 * config.activeTab - defaults to the name of the first file in config.files
 */
export interface TourTargetState {
  terminal?: TourTerminalTarget[];
  status?: TourStatusTarget[];
  config?: TourConfigSimTarget;
  logs?: TourLogsSimTarget[];
  banner?: EngineTargetState["banner"];
}

// ============================================================================
// Player frames
// ============================================================================

type SimulatorFrameConfigs = {
  [SIMULATORS.TERMINAL]: {
    [FRAME_TYPES.ENTER_COMMAND]: NonNullable<TourTargetState["terminal"]>;
  };
  [SIMULATORS.STATUS]: {
    [FRAME_TYPES.ADD_SERVICES]: NonNullable<TourTargetState["status"]>;
  };
  [SIMULATORS.CONFIG]: {
    [FRAME_TYPES.ADD]: NonNullable<TourTargetState["config"]>;
    [FRAME_TYPES.SCROLL_TO]: Frames.ConfigSimScrollTarget;
  };
  [SIMULATORS.LOGS]: {
    [FRAME_TYPES.ADD]: TourLogsSimTarget;
    [FRAME_TYPES.STREAM]: TourLogsSimTarget & { duration?: number };
    [FRAME_TYPES.PAUSE]: undefined;
  };
  [SIMULATORS.BANNER]: {
    [FRAME_TYPES.UPDATE]: NonNullable<TourTargetState["banner"]>;
  };
};

type FramesForSim<Sim extends keyof SimulatorFrameConfigs> = {
  [F in keyof SimulatorFrameConfigs[Sim]]: Frames.Frame<
    Extract<Sim, Kinds.SimulatorType>,
    Extract<F, Frames.ConstructedFrameKind>,
    SimulatorFrameConfigs[Sim][F]
  >;
};

type FrameUnionForSim<Sim extends keyof SimulatorFrameConfigs> =
  FramesForSim<Sim>[keyof SimulatorFrameConfigs[Sim]];

export type ActivateSimulatorFrameOptional = Omit<
  Frames.ActivateSimulatorFrame,
  "duration"
> &
  Partial<Pick<Frames.ActivateSimulatorFrame, "duration">>;

export type AnyFrame =
  | {
      [S in keyof SimulatorFrameConfigs]: FrameUnionForSim<S>;
    }[keyof SimulatorFrameConfigs]
  | Frames.DelayFrame
  | Frames.ClearSimulatorsFrame
  | ActivateSimulatorFrameOptional;

// ============================================================================
// Drawer/Steps
// ============================================================================

/**
 * actions - click handlers assigned by index to elements in the content item
 * onClick - click handler assigned to an item level click event
 */
export interface TourContentItem extends Steps.ContentItem {
  actions?: AnyFrame[];
  onClick?: AnyFrame;
}

interface ContentBlock {
  title?: string;
  variant?: "default" | "list";
  items: (TourContentItem | Steps.VisualizationContentItem)[];
}

export interface SubStepConfig {
  id: string;
  title?: string;
  content: ContentBlock[];
  visualizationModal?: boolean;
  initialState?: TourTargetState;
  animation?: AnyFrame[];
}

export interface StepConfig {
  id: string;
  title: string;
  subSteps: SubStepConfig[];
}

export interface TourConfiguration {
  id: string;
  version: string;
  title: string;
  subtitle?: string;
  description?: string;
  steps: StepConfig[];
  coming_soon?: boolean;
  buttonText?: string;
  default_open?: boolean;
}
