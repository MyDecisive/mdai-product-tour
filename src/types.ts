import type { TreeItemSlotProps } from "@mui/x-tree-view";
import type { JSX } from "react";

export type View = string;

export type ViewTreeItemProps = {
  itemId: string;
  label: string;
  content?: JSX.Element | null;
  slotProps?: TreeItemSlotProps & { label?: { subLabel?: string } };
  subSteps?: Omit<ViewTreeItemProps, "subSteps">[];
};
