import type { TreeItemSlotProps } from "@mui/x-tree-view";
import type { JSX } from "react";
import { ITEM_IDS } from "../views/common";

export type View = string;
export type StepItemId = (typeof ITEM_IDS)[keyof typeof ITEM_IDS];

export type FullScreenModalType = "contact" | "finished";

export type FullScreenModalContentProps = {
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
  substep?: StepItemId;
  fullScreenModal?: FullScreenModalType;
}

export type SimulatorBoxProps = {
  title: string;
  link?: string;
  href?: string;
  styles?: React.CSSProperties;
  innerStyles?: React.CSSProperties;
  children?: React.ReactNode;
};

export type LineRange = { start: number; end: number };

export type ConfigTextProps = {
  text?: string;
  activeRange?: LineRange;
  view: string;
  title?: string;
};

export type PanelId = "config" | "terminal" | "status" | "logs";

export interface Service {
  name: string;
  replicas?: number;
  skipStartup?: boolean;
}

export type SimAction =
  | { t?: number; delay?: number } & (
      | {
          simType: "config.show";
          href?: string;
          configFile: string;
          range?: LineRange;
          text?: string;
          configName?: string;
        }
      | { simType: "terminal.run"; cmd: string }
      | { simType: "terminal.out"; text: string }
      | {
          simType: "status.set";
          text: string | string[] | Record<string, unknown>;
        }
      | { simType: "logs.append"; lines: string[] }
      | { simType: "wait"; ms: number }
    );

export type SimScript = SimAction[];

export interface LogRecord {
  message?: string;
  content?: string;
  level?: string;
  timestamp?: string;
  id?: string;
  [key: string]: any;
}
