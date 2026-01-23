import { FRAME_TYPES, SIMULATORS } from "../utils/constants";
import type * as Frames from "./frames";
import type * as Kinds from "./kinds";
import type { Player as RuntimePlayer, ScrollTarget } from "./player";
import type * as Steps from "./steps";

// ============================================================================
// Simulator/Player state
// ============================================================================

// Terminal simulator
export interface TerminalEntry {
  input: string;
  outputs?: string[];
}

// Status simulator
/**
 * namespace - defaults to "default"
 * replicas - defaults to 1
 * noSuffix - defaults to false
 */
export interface Service {
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

interface ConfigFileSource {
  url: string;
  fileName?: string;
  changes?: LineChangeBlock[];
}

// Logs simulator
/**
 * fileName - file name for local file which must be located in public/logs/
 * logFormat - determines which parser, display will be used
 * speed - defaults to 1000
 * contextName - the name of the Service these logs represent
 */
export interface LogsFileSource {
  fileName: string;
  logFormat: Kinds.LogFormat;
  speed?: number;
  contextName: string;
}

/**
 * config.activeTab - defaults to the name of the first file in config.files
 */
export interface Player {
  terminal?: TerminalEntry[];
  status?: Service[];
  config?: {
    files: ConfigFileSource[];
    activeTab?: string; // defaults to first file
  };
  logs?: LogsFileSource[];
  banner?: RuntimePlayer["banner"];
}

// ============================================================================
// Player frames
// ============================================================================

type SimulatorFrameConfigs = {
  [SIMULATORS.TERMINAL]: {
    [FRAME_TYPES.ENTER_COMMAND]: TerminalEntry[];
  };
  [SIMULATORS.STATUS]: {
    [FRAME_TYPES.ADD_SERVICES]: Service[];
  };
  [SIMULATORS.CONFIG]: {
    [FRAME_TYPES.ADD]: {
      files: ConfigFileSource[];
      activeTab?: string;
    };
    [FRAME_TYPES.SCROLL_TO]: ScrollTarget;
  };
  [SIMULATORS.LOGS]: {
    [FRAME_TYPES.ADD]: LogsFileSource;
    [FRAME_TYPES.STREAM]: LogsFileSource & { duration?: number };
    [FRAME_TYPES.PAUSE]: undefined;
  };
  [SIMULATORS.BANNER]: {
    [FRAME_TYPES.UPDATE]: NonNullable<RuntimePlayer["banner"]>;
  };
};

type FramesForSim<Sim extends keyof SimulatorFrameConfigs> = {
  [F in keyof SimulatorFrameConfigs[Sim]]: Frames.Frame<
    Extract<Sim, Kinds.Simulator>,
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
export interface ContentItem extends Steps.BaseContentItem {
  actions?: AnyFrame[];
  onClick?: AnyFrame;
}

interface ContentBlock {
  title?: string;
  variant?: "default" | "list";
  items: (ContentItem | Steps.Visualization)[];
}

export interface SubStep {
  id: string;
  title?: string;
  content: ContentBlock[];
  visualizationModal?: boolean;
  initialState?: Player;
  animation?: AnyFrame[];
}

export interface Step {
  id: string;
  title: string;
  subSteps: SubStep[];
}

export interface Definition {
  id: string;
  version: string;
  title: string;
  subtitle?: string;
  description?: string;
  steps: Step[];
  coming_soon?: boolean;
  buttonText?: string;
  default_open?: boolean;
}
