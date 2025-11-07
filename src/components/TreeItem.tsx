import { css, type CSSObject } from "@emotion/react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import {
  TreeItem as MuiTreeItem,
  type TreeItemProps as MuiTreeItemProps,
  TreeItemLabel,
} from "@mui/x-tree-view/TreeItem";
import { type ReactNode } from "react";

type TreeItemProps = {
  topLevel?: boolean;
} & MuiTreeItemProps;

type TopLevelLabelProps = {
  style?: CSSObject;
  itemId: string;
  label?: string;
  subLabel?: string;
  children?: ReactNode;
};

export const subLabelStyles = css({
  color: "#9E9E9E",
  fontStyle: "italic",
  fontFamily: "Inter",
});

function TopLevelLabel(props: TopLevelLabelProps) {
  const { label, children, subLabel, style } = props;
  return (
    <Box>
      <Typography sx={css([style, { fontWeight: 700, fontSize: "20px" }])}>
        {label || children}
      </Typography>
      {subLabel && (
        <Typography sx={css([subLabelStyles])}>Coming soon</Typography>
      )}
    </Box>
  );
}

export function TreeItem(props: TreeItemProps) {
  const { topLevel, ...restProps } = props;
  return (
    <MuiTreeItem
      slots={{
        label: topLevel ? TopLevelLabel : TreeItemLabel,
      }}
      {...restProps}
    />
  );
}
