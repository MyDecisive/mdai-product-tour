import type { TreeItemSlotProps } from "@mui/x-tree-view";
import type { JSX } from "react";
import type { TypedOptions } from "typed.js";
import { ITEM_IDS } from "../utils/constants";

export type View = string;
export type StepItemId = (typeof ITEM_IDS)[keyof typeof ITEM_IDS];

export type BigContentModalType = "contact" | "finished";

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
};

export interface Service {
  name: string;
  replicas?: number;
  skipStartup?: boolean;
}
export interface LogRecord {
  message?: string;
  content?: string;
  level?: string;
  timestamp?: string;
  id?: string;
  [key: string]: unknown;
}

export type LineRange = { start: number; end: number };

export interface ConfigTextProps {
  text?: string;
  activeRange?: LineRange;
  title?: string;
  href?: string;
}

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
  namespace?: string;
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
}

export interface AnimationAction {
  type: "state_update" | "delay";
  delay?: number;
  stateChanges?: Partial<SimulatorPanelState>;
}

export interface StepDefinition {
  initialState: SimulatorPanelState;
  animations: AnimationAction[];
}

export type StepDefinitions = Record<StepItemId, StepDefinition>;

export type InfoBannerProps = {
  percentText?: string;
  percentFiltered?: number | null;
  logs: {
    received: number;
    sentToVendor: number;
    filtered: number;
  };
};
