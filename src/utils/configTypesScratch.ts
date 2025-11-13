import {
  type BannerTargetState,
  type LineChangeBlock,
  type TourFrames,
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
  banner?: BannerTargetState;
}

// ============================================================================
// TOUR CONFIG STRUCTURE
// ============================================================================
export interface TourConfiguration {
  id: string;
  version: string;
  title: string;
  subtitle?: string;
  description?: string;
  steps?: StepConfig[];
  coming_soon?: boolean;
  buttonText?: string;
  default_open?: boolean;
}

export interface StepConfig {
  id: string;
  title: string;
  subSteps: SubStepConfig[];
}

export interface SubStepConfig {
  id: string;
  title?: string;
  content?: ContentBlock;
  visualizationModal?: boolean;
  initialState?: TourTargetState;
  animation?: TourFrames["Any"][];
}

// ============================================================================
// DRAWER CONTENT CONFIG
// ============================================================================
export interface ContentBlock {
  title: string | null;
  variant?: "default" | "list" | "visualization";
  items?: Array<ContentItem | VisualizationContentItem>;
}

export interface ContentItem {
  text: string;
  highlightText?: HighlightText;
  variant?: "code" | "button" | "list";
  link?: string;
  style?: React.CSSProperties;
}

export interface VisualizationContentItem extends ContentItem {
  src: string;
  alt: string;
}

export type HighlightText = {
  text: string;
  simulator: "status" | "config" | "logs" | "terminal";
};
