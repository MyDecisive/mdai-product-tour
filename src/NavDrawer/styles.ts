import { css } from "@emotion/react";
import { treeItemClasses } from "@mui/x-tree-view/TreeItem";

export const NavDrawerStyles = css({
  backgroundColor: "#ECECEC",
});

export const NavDrawerHeaderStyles = css({
  fontSize: "24px",
  fontWeight: 600,
  color: "#3A3A3A",
  fontFamily: "Inter",
});

export const PrimaryCTAButtonStyles = css({
  borderRadius: "4px",
  backgroundColor: "#B062C2",
  color: "black",
  fontWeight: 700,
  padding: "12px 36px",
});

export const NavTreeItemStyles = css({
  [`& .${treeItemClasses.groupTransition}`]: {
    marginLeft: "7px",
    paddingBottom: "8px",
    paddingTop: "4px",
  },
  [`& .${treeItemClasses.label}`]: {
    textTransform: "uppercase",
    fontWeight: 600,
    fontFamily: "Inter",
  },
  [`& .${treeItemClasses.content}`]: {
    paddingLeft: 0,
    paddingRight: 0,
    paddingBottom: "8px",
    backgroundColor: "initial",
    marginTop: "24px",
  },
  [`& .${treeItemClasses.content}:hover`]: {
    backgroundColor: "initial",
  },
  [`& .${treeItemClasses.content}[data-selected]`]: {
    backgroundColor: "initial",
  },
  [`& .${treeItemClasses.content}[data-selected]:hover`]: {
    backgroundColor: "initial",
  },
});

export const NavTreeSubStepStyles = css({
  [`& .${treeItemClasses.label}`]: {
    textTransform: "none",
  },
  [`& .${treeItemClasses.groupTransition}`]: {
    paddingLeft: "6px",
  },
});

export const NavTreeItemTourStyles = css({
  [`& .${treeItemClasses.content}`]: {
    marginTop: "8px",
  },
  [`& .${treeItemClasses.groupTransition}`]: {
    paddingLeft: "24px",
    position: "relative",
  },
  [`& .${treeItemClasses.groupTransition}:after`]: {
    position: "absolute",
    content: '""',
    borderLeft: `2px solid #D9D9D9`,
    left: 0,
    top: 0,
    bottom: "8px",
  },
});

export const NavDrawerBodyStyles = css({
  padding: "24px 14px 24px 24px",
  height: "100%",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
});

export const ComingSoonStyles = css({
  color: "#8A38F5",
  fontStyle: "italic",
  paddingLeft: "1.5rem",
  fontFamily: "Inter",
});
