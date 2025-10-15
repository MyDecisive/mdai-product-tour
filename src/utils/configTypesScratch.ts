import type { FRAME_TYPES, SIMULATORS } from "./constants";
import type {
  ClearSimulatorsFrame,
  DelayFrame,
  Frame,
  LineChangeBlock,
} from "./types";

// ============================================================================
// TOUR CONFIG TARGET STATES
// ============================================================================
export interface TourTerminalTarget {
  input: string;
  outputs?: string[];
}

export interface TourStatusTarget {
  name: string;
  namespace?: string; // defaults to "default"
  replicas?: number; // defaults to 1
  noSuffix?: boolean; // defaults to false
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

export interface TourTargetState {
  terminal?: TourTerminalTarget[];
  status?: TourStatusTarget[];
  config?: TourConfigSimTarget;
}

// ============================================================================
// CONFIG ANIMATION FRAMES
// ============================================================================

export declare namespace TourFrames {
  export namespace Terminal {
    export type EnterCommand = Frame<
      typeof SIMULATORS.TERMINAL,
      typeof FRAME_TYPES.enter_command,
      TourTerminalTarget[]
    >;
    export type All = EnterCommand;
  }

  export namespace Status {
    export type AddServices = Frame<
      typeof SIMULATORS.STATUS,
      typeof FRAME_TYPES.add_services,
      TourStatusTarget[]
    >;
    export type All = AddServices;
  }

  export type Any =
    | Terminal.All
    | Status.All
    | DelayFrame
    | ClearSimulatorsFrame;
}

// ============================================================================
// TOUR CONFIG STRUCTURE
// ============================================================================
export interface TourConfig {
  id: string;
  version: string;
  title: string;
  description?: string;
  steps: StepConfig[];
}

interface StepConfig {
  id: string;
  label: string;
  substeps: SubstepConfig[];
}

export interface SubstepConfig {
  id: string;
  label: string;
  subLabel?: string;
  content: ContentConfig;
  targetState: TourTargetState;
  animation?: TourFrames.Any[];
}

// ============================================================================
// DRAWER CONTENT CONFIG
// ============================================================================
export type ContentConfig = TextContentConfig | ListContentConfig;

interface TextContentConfig {
  type: "text";
  title?: string;
  text: string; // Supports <code>...</code> and <highlight:simulator>...</highlight>
}

interface ListContentConfig {
  type: "list";
  title?: string;
  items: ListItemConfig[];
}

interface ListItemConfig {
  text: string; // Supports <code>...</code> and <highlight:simulator>...</highlight>
  onItemClick?: ItemClickDirective;
}

// Directive for what happens when list item is clicked
interface ItemClickDirective {
  simulator: "config" | "terminal" | "status" | "logs";
  action: TourFrames.Any;
}
