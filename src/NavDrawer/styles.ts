import { css } from "@emotion/react";
import { treeItemClasses } from "@mui/x-tree-view/TreeItem";

export const NavDrawerStyles = css({
  backgroundColor: "#ECECEC",
});

export const NavDrawerHeaderStyles = css({
  fontSize: "24px",
  fontWeight: "bold",
  color: "#3A3A3A",
  fontFamily: "Inter",
});

export const NavTreeItemStyles = css({
  [`& .${treeItemClasses.groupTransition}`]: {
    marginLeft: 15,
    paddingLeft: 18,
  },
  [`& .${treeItemClasses.label}`]: {
    textTransform: "uppercase",
    fontFamily: "Inter",
  },
  [`& .${treeItemClasses.content}[data-selected]`]: {
    backgroundColor: "initial",
  },
});

export const NavTreeItemTourStyles = css({
  [`& .${treeItemClasses.groupTransition}`]: {
    borderLeft: `1px solid #D9D9D9`,
  },
});

export const NavDrawerBodyStyles = css({
  padding: "48px 24px 24px 24px",
  height: "100%",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
});

export const ComingSoonStyles = css({
  color: "#8A38F5",
  fontStyle: "italic",
  paddingLeft: "2rem",
  fontFamily: "Inter",
});
