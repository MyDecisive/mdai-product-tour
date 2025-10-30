import { TreeItem, treeItemClasses } from "@mui/x-tree-view";
import { css } from "@emotion/react";
import type { SubStep } from "../../../utils/drawerTypes";
import { ContentBlock } from "./Content";
import { StepNavButtons } from "../StepNavButtons";

const NavTreeSubStepStyles = css({
  [`& .${treeItemClasses.groupTransition}`]: {
    marginTop: "8px",
    borderLeft: `1px solid rgba(111, 111, 111, 0.50)`,
    padding: "8px 16px 0 16px",
  },
  [`& .${treeItemClasses.iconContainer} > svg`]: {
    padding: "4px",
  },
});

export function SubStep({
  id,
  title,
  content,
  visualizationModal = false,
}: SubStep) {
  console.log("Rendering SubStep:", id, title);
  return (
    <>
      <TreeItem
        key={id}
        sx={NavTreeSubStepStyles}
        itemId={id}
        label={title && !visualizationModal ? title : ""}
      >
        {content && (
          <ContentBlock
            contentBlock={content}
            visualization={visualizationModal}
          />
        )}
        <StepNavButtons />
      </TreeItem>
    </>
  );
}
