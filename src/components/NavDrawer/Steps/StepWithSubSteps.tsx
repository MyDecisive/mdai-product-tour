import type { Step } from "../../../types/steps";
import { TreeItem } from "../../TreeItem";
import { SubStep } from "./SubStep";


export function StepWithSubSteps({ itemId, title, subSteps }: Step) {
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
