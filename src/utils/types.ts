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
