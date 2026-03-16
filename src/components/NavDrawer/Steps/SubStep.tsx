import { css } from "@emotion/react";
import { TreeItem, treeItemClasses } from "@mui/x-tree-view";
import type { SubStep } from "../../../types/steps";
import { StepNavButtons } from "../StepNavButtons";
import { ContentBlock } from "./Content";

const NavTreeSubStepStyles = css({
  [`& .${treeItemClasses.groupTransition}`]: {
    marginTop: "8px",
    borderLeft: `1px solid rgba(111, 111, 111, 0.50)`,
    padding: "8px 16px 0 16px",
  },
  [`& .${treeItemClasses.iconContainer} > svg`]: {
    padding: "4px",
  },
  // [`& :not(:first-child)`]: {
  //   marginTop: "16px",
  // }
});

export function SubStep({ itemId, title, content }: SubStep) {
  return (
    <>
      <TreeItem
        key={itemId}
        sx={NavTreeSubStepStyles}
        itemId={itemId}
        label={title ? title : ""}
      >
        {content &&
          content.length &&
          content.map((block, index) => (
            <ContentBlock
              {...block}
              key={`${block.title}-${block.variant}-${index}`}
            />
          ))}
        <StepNavButtons />
      </TreeItem>
    </>
  );
}
