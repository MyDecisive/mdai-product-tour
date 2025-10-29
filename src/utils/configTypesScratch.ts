import { type LineChangeBlock, type TourFrames } from "./types";

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

// Assumes the file at the URL is what will be shown at the end of an animation set
interface TourFileTarget {
  url: string;
  fileName?: string;
  changes?: LineChangeBlock[];
}

export interface TourConfigSimTarget {
  files: TourFileTarget[];
  activeTab?: string; // defaults to first file
}

export interface TourLogSimTarget {
  logsSources?: string[]; // local files -- must be a log file in public/logs/
  speed?: number; // defaults to 1000
  errorLogsSource?: string; // local file -- must be a log file in public/logs/
  errorFrequency?: number; // defaults to 0.1
}

export interface TourTargetState {
  terminal?: TourTerminalTarget[];
  status?: TourStatusTarget[];
  config?: TourConfigSimTarget;
  logs?: TourLogSimTarget;
}

// ============================================================================
// TOUR CONFIG STRUCTURE
// ============================================================================
export interface TourConfiguration {
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
  animation?: TourFrames["Any"][];
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
  action: TourFrames["Any"];
}
