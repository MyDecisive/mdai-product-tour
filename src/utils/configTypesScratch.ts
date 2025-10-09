import type { FRAME_TYPES, SIMULATORS } from "./constants";
import type { ClearSimulatorsFrame, DelayFrame, Frame } from "./types";

// ============================================================================
// CONFIG TARGET STATES
// ============================================================================
export interface ConfigTerminalTarget {
  input: string;
  outputs?: string[];
}

export interface ConfigStatus {
  name: string;
  namespace?: string; // defaults to "default"
  replicas?: number; // defaults to 1
  noSuffix?: boolean; // defaults to false
}

export interface ConfigTargetState {
  terminal?: ConfigTerminalTarget[];
  status?: ConfigStatus[];
}

// ============================================================================
// CONFIG ANIMATION FRAMES
// ============================================================================

export namespace ConfigFrames {
  export namespace Terminal {
    export type EnterCommand = Frame<
      typeof SIMULATORS.TERMINAL,
      typeof FRAME_TYPES.enter_command,
      ConfigTerminalTarget[]
    >;
    export type All = EnterCommand;
  }

  export namespace Status {
    export type AddServices = Frame<
      typeof SIMULATORS.STATUS,
      typeof FRAME_TYPES.add_services,
      ConfigStatus[]
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
  targetState: ConfigTargetState;
  animation?: ConfigFrames.Any[];
}

// ============================================================================
// DRAWER CONTENT CONFIG
// ============================================================================
type ContentConfig = TextContentConfig | ListContentConfig;

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
  action: ConfigFrames.Any;
}
