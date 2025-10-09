import type { ANIMATION_TYPES, SIMULATORS } from "./constants";
import type { BaseEngineAnimation, DelayAnimation } from "./types";

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

export interface ConfigTerminalTarget {
  input: string;
  outputs?: string[];
}

export interface ConfigStatus {
  name: string;
  namespace?: string; // defaults to "default"
  replicas?: number; // defaults to 1
  noSuffix?: boolean; // defaults to false
  skipStartup?: boolean; // if true, the startup sequence is ignored
}

interface ConfigTargetState {
  terminal?: ConfigTerminalTarget[];
  status?: ConfigStatus[];
}

export interface ConfigStatusAnimationAddService extends BaseEngineAnimation {
  simulator: typeof SIMULATORS.STATUS;
  type: typeof ANIMATION_TYPES.add_services;
  updates: {
    services: ConfigStatus[];
  };
}

interface ConfigTerminalAnimationClear extends BaseEngineAnimation {
  simulator: typeof SIMULATORS.TERMINAL;
  type: typeof ANIMATION_TYPES.clear;
  updates?: undefined;
}

interface ConfigTerminalAnimationEnterCommand extends BaseEngineAnimation {
  simulator: typeof SIMULATORS.TERMINAL;
  type: typeof ANIMATION_TYPES.enter_command;
  updates: ConfigTerminalTarget;
}

type ConfigTerminalAnimation =
  | ConfigTerminalAnimationClear
  | ConfigTerminalAnimationEnterCommand;

type ConfigFrame =
  | DelayAnimation
  | ConfigTerminalAnimation
  | ConfigStatusAnimationAddService;

interface SubstepConfig {
  id: string;
  label: string;
  subLabel?: string;
  content: ContentConfig;
  targetState: ConfigTargetState;
  animation?: ConfigFrame[];
}

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
  action: ConfigFrame;
}
