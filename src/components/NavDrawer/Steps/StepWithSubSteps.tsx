import type { StepItem } from "../../../utils/types";
import { TreeItem } from "../../TreeItem";
import { SubStep } from "./SubStep";

export function StepWithSubSteps({ itemId, title, subSteps }: StepItem) {
  return (
    <>
      <TreeItem
        topLevel
        itemId={itemId}
        label={title}
        slotProps={{
          label: {
            style: { textTransform: "uppercase" },
          },
        }}
      >
        {subSteps.map(({ title, content, itemId }) => (
          <SubStep key={itemId} id={itemId} title={title} content={content} />
        ))}
      </TreeItem>
    </>
  );
}
