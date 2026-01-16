import type { AnyFrame } from "./frames";
import type { EngineTargetState } from "./player";

export interface ContentItem {
  text: string;
  bullet?: string;
}

export interface VisualizationContentItem extends ContentItem {
  src: string;
  alt: string;
}

export type BigContentModalType = "finished" | "results";

export interface NavigationState {
  tour: string;
  step: number;
  subStep: number;
  bigContentModal: BigContentModalType | null;
}

/**
 * actions - click handlers assigned by index to elements in the content item
 * onClick - click handler assigned to an item level click event
 */
export interface EngineContentItem extends ContentItem {
  actions?: AnyFrame[];
  onClick?: AnyFrame;
}

export interface EngineContentBlock {
  title?: string;
  variant?: "default" | "list";
  items: (EngineContentItem | VisualizationContentItem)[];
}

export interface EngineSubStep {
  id: string;
  itemId: string;
  title?: string;
  content: EngineContentBlock[];
  visualizationModal?: boolean;
  initialState?: EngineTargetState;
  animation?: AnyFrame[];
  targetState?: EngineTargetState;
  previousSubStep: NavigationState;
  nextSubStep: NavigationState;
}

export interface EngineStep {
  id: string;
  itemId: string;
  title: string;
  subSteps: EngineSubStep[];
}

export interface TourEngine {
  id: string;
  version: string;
  title: string;
  subtitle?: string;
  description?: string;
  steps: EngineStep[];
  coming_soon?: boolean;
  buttonText?: string;
  default_open?: boolean;
}

export interface TourSelectionItem {
  id: string;
  itemId: string;
  title: string;
  subtitle?: string;
  comingSoon: boolean;
  buttonText?: string;
  onTourSelect?: () => void;
}
