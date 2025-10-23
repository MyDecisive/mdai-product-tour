export interface HighlightText {
  text: string;
  simulator: "status" | "config" | "logs" | "terminal";
}

export interface ContentItem {
  text: string | null;
  highlightText?: HighlightText;
  variant?: "code" | "button";
  link?: string;
  style?: React.CSSProperties;
}

export interface VisualizationContentItem extends ContentItem {
  src: string;
  alt: string;
}

export interface ContentBlock {
  title: string | null;
  variant?: "default" | "list" | "visualization";
  items?: Array<ContentItem | VisualizationContentItem>;
}

export interface SubStep {
  id: string;
  title?: string;
  content?: ContentBlock;
  visualizationModal?: boolean;
}

export interface Step {
  id: string;
  title?: string;
  substeps?: Array<SubStep>;
}

export interface Tours {
  id: string;
  title: string;
  subtitle?: string;
  steps?: Step[];
  coming_soon?: boolean;
  buttonText?: string;
}

export interface DrawerConfig {
  tours: Tours[];
}

export interface HomeConfig {
  id: string;
  title: string;
  subtitle: string;
  tours: Tours[];
}
