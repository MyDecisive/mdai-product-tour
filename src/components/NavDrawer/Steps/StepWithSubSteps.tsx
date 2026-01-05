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
        {subSteps.map((subStep) => (
          <SubStep key={subStep.itemId} {...subStep} />
        ))}
      </TreeItem>
    </>
  );
}
