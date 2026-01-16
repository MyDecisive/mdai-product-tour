import type { AnyFrame } from "./frames";
import type { Player } from "./player";

export interface BaseContentItem {
  text: string;
  bullet?: string;
}

export interface Visualization extends BaseContentItem {
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
export interface ContentItem extends BaseContentItem {
  actions?: AnyFrame[];
  onClick?: AnyFrame;
}

export interface ContentBlock {
  title?: string;
  variant?: "default" | "list";
  items: (ContentItem | Visualization)[];
}

export interface SubStep {
  id: string;
  itemId: string;
  title?: string;
  content: ContentBlock[];
  visualizationModal?: boolean;
  initialState?: Player;
  animation?: AnyFrame[];
  targetState?: Player;
  previousSubStep: NavigationState;
  nextSubStep: NavigationState;
}

export interface Step {
  id: string;
  itemId: string;
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

export interface SelectionItem {
  id: string;
  itemId: string;
  title: string;
  subtitle?: string;
  comingSoon: boolean;
  buttonText?: string;
  onTourSelect?: () => void;
}
