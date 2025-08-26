import { css } from "@emotion/react";
import { treeItemClasses } from "@mui/x-tree-view/TreeItem";

export const PrimaryCTAButtonStyles = css({
  borderRadius: "4px",
  backgroundColor: "#B062C2",
  color: "black",
  fontWeight: 700,
  padding: "12px 36px",
});

export const NavTreeSubStepStyles = css({
  [`& .${treeItemClasses.groupTransition}`]: {
    position: "relative",
    marginTop: "8px",
    borderLeft: `1px solid rgba(111, 111, 111, 0.50)`,
    padding: "8px 16px 0 16px",
  },
});

export const ComingSoonStyles = css({
  color: "#8A38F5",
  fontStyle: "italic",
  paddingLeft: "1.5rem",
  fontFamily: "Inter",
});
