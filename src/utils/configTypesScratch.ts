import type {
  BannerTargetState,
  ContentItem,
  LineChangeBlock,
  TourFrames,
  VisualizationContentItem,
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
  contextName: string; // The name of the service/pod these logs represent
}

export interface TourTargetState {
  terminal?: TourTerminalTarget[];
  status?: TourStatusTarget[];
  config?: TourConfigSimTarget;
  logs?: TourLogSimTarget[];
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
  content: ContentBlock[];
  visualizationModal?: boolean;
  initialState?: TourTargetState;
  animation?: TourFrames["Any"][];
}

// ============================================================================
// DRAWER CONTENT CONFIG
// ============================================================================
export interface ContentBlock {
  title?: string;
  variant?: "default" | "list";
  items: (TourContentItem | VisualizationContentItem)[];
}

export interface TourContentItem extends ContentItem {
  actions?: TourFrames["Any"][];
  onClick?: TourFrames["Any"]; // Item-level click handler
}
