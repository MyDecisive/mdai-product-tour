interface ContentItem {
  text: string | null;
  highlightText?: string;
  animated?: boolean;
  variant?: 'code' | 'button' | 'animated';
  onClick?: () => void;
}

interface VisualizationContentItem extends ContentItem {
  src: string;
  alt: string;
}

interface ContentBlock {
  title: string | null;
  variant?: 'default' | 'list';
  items?: Array<ContentItem | VisualizationContentItem>;
}

interface SubStep {
  id: string;
  title?: string;
  content?: ContentBlock;
  visualizationModal?: true;
}

interface Step {
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