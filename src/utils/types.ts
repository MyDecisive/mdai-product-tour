import type { TreeItemSlotProps } from "@mui/x-tree-view";
import type { JSX, RefObject } from "react";
import type { TypedOptions } from "typed.js";
import { ITEM_IDS } from "../utils/constants";

export type View = string;
export type StepItemId = (typeof ITEM_IDS)[keyof typeof ITEM_IDS];

export type BigContentModalType = "contact" | "finished" | "results";

export type BigContentModalContentProps = {
  handleClose: () => void;
};

export interface ViewTreeItem {
  label: string;
  content?: JSX.Element | null;
  slotProps?: TreeItemSlotProps & { label?: { subLabel?: string } };
}

export interface ViewTreeItemProps extends ViewTreeItem {
  itemId: StepItemId;
  subSteps?: Omit<ViewTreeItemProps, "subSteps">[];
}

export type StepItemMap = Record<StepItemId, ViewTreeItem>;

export type ViewStep = { stepId: StepItemId; subStepIds?: StepItemId[] };

export type ViewStepOrder = ViewStep[];

export interface NavigationState {
  view: View;
  step?: StepItemId;
  subStep?: StepItemId;
  bigContentModal?: BigContentModalType;
}

export type AnimationState = number;

export type SimulatorBoxProps = {
  title: string;
  link?: string;
  href?: string;
  styles?: React.CSSProperties;
  innerStyles?: React.CSSProperties;
  children?: React.ReactNode;
  active?: boolean;
  ref?: RefObject<HTMLDivElement | null>;
};

export interface Service {
  name: string;
  namespace: string;
  replicas?: number;
  skipStartup?: boolean;
  noSuffix?: boolean;
}
export interface LogRecord {
  message?: string;
  content?: string;
  level?: string;
  timestamp?: string;
  id?: string;
  [key: string]: unknown;
}

export type LineChangeBlock = {
  start: number;
  end?: number;
  oldValues: string[];
};

export interface ConfigTextProps {
  files: Record<string, FileConfig>;
  activeFileTitle?: string;
}

export type LineToggles = Record<number, boolean>;
export interface FileConfig {
  text?: string;
  changes?: LineChangeBlock[];
  href?: string;
  initialLineToggles?: LineToggles;
  showToggleButtons?: boolean;
}

export interface TextGroup {
  lines: ProcessedLine[];
  startLineNo: number;
  endLineNo: number;
  isChangeBlock: boolean;
  isGap?: boolean;
}

export interface ConfigSimulatorTabContent {
  title: string;
  href?: string;
  textGroups: TextGroup[];
  pulsedLines: Set<number>;
  showToggleButtons: boolean | undefined;
  containerRef: React.RefObject<HTMLDivElement | null>;
  toggleLineValue: (lineNos: number[]) => void;
}

export type ProcessedLine = {
  lineNo: number;
  content: string;
  isHighlighted: boolean;
  hasChange?: boolean;
  newValue?: string;
  showingNewValue?: boolean;
  isGap?: boolean;
};

export interface TerminalTypedOptions extends TypedOptions {
  prompt?: string;
}

export interface TerminalTypedProps {
  typedOptions?: TerminalTypedOptions[];
  style?: React.CSSProperties;
  className?: string;
  contextLabel?: string;
}

export interface StatusProps {
  contextLabel?: string;
  services?: Service[];
}

export interface LogSimulatorProps {
  logRecords?: LogRecord[];
  speed?: number;
  errorLogs?: LogRecord[];
  errorFrequency?: number;
  isPaused?: boolean;
  contextLabel?: string;
}

type WithPanelState<T> = T & {
  active?: boolean;
};

export interface SimulatorPanelState {
  config: WithPanelState<ConfigTextProps> | null;
  terminal: WithPanelState<TerminalTypedProps> | null;
  status: WithPanelState<StatusProps> | null;
  logs: WithPanelState<LogSimulatorProps> | null;
  banner: InfoBannerProps | null;
}

export interface AnimationAction {
  type: "state_update" | "delay";
  delay?: number;
  stateChanges?: DeepPartial<SimulatorPanelState>;
}

export interface StepDefinition {
  initialState: SimulatorPanelState;
  animations: AnimationAction[];
}

export type StepDefinitions = Record<StepItemId, StepDefinition>;

export type InfoBannerProps = {
  percentText?: string;
  showPercentFiltered?: boolean;
  logs: {
    sentToVendor: number;
    filtered: number;
  };
};
export interface TourState {
  navigation: NavigationState;
  animationIndex: number;
}

export type DeepPartial<T> = Partial<{
  [P in keyof T]: T[P] extends object
    ? T[P] extends Array<infer U>
      ? Array<DeepPartial<U>>
      : DeepPartial<T[P]>
    : Partial<T[P]>;
}>;
