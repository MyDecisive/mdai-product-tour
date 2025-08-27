import { Logs, PII, Traces } from "../constants";
import type { StepItemMap, ViewStepOrder, ViewTreeItemProps } from "../types";

export const ITEM_IDS = {
  introduction: "introduction",
  step1: "step1",
  step2: "step2",
  step3: "step3",
  introduction_what: "introduction_what",
  introduction_unified: "introduction_unified",
  step1_data: "step1_data",
  step1_visualize: "step1_visualize",
  step2_configure: "step2_configure",
  step2_take: "step2_take",
  step2_explore: "step2_explore",
  step2_visualize: "step2_visualize",
  step3_add: "step3_add",
  step3_take: "step3_take",
  step3_vizualize: "step3_vizualize",
  Logs,
  Traces,
  PII,
} as const;

export function hydrateViewTreeitems(
  itemsMap: StepItemMap,
  order: ViewStepOrder
): ViewTreeItemProps[] {
  return order.map(({ stepId, subStepIds }) => {
    const step = itemsMap[stepId];
    if (!step) {
      throw new Error(`Step with ID "${stepId}" not found in map`);
    }

    if (subStepIds && subStepIds.length) {
      const subSteps = subStepIds.map((substepId) => {
        const substep = itemsMap[substepId];
        if (!substep) {
          throw new Error(`Substep with ID "${substepId}" not found in map`);
        }
        return {
          itemId: substepId,
          ...substep,
        };
      });

      return {
        itemId: stepId,
        ...step,
        subSteps,
      };
    }
    return {
      itemId: stepId,
      ...step,
    };
  });
}
