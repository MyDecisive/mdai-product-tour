export type HighlightText = {
  text: string;
  simulator: "status" | "config" | "logs" | "terminal";
};

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

export interface Tour {
  id: string;
  title: string;
  subtitle?: string;
  steps?: Step[];
  coming_soon?: boolean;
  buttonText?: string;
}

export interface DrawerConfig {
  tours: Tour[];
  home: HomeConfig[];
}

export interface HomeConfig {
  id: string;
  title: string;
  subtitle: string;
  tours: Tour[];
}
