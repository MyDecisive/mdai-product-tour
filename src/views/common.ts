import type {
  DeepPartial,
  SimulatorPanelState,
  StepItemMap,
  ViewStepOrder,
  ViewTreeItemProps,
} from "../utils/types";

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
      const subSteps = subStepIds.map((subStepId) => {
        const subStep = itemsMap[subStepId];
        if (!subStep) {
          throw new Error(`SubStep with ID "${subStepId}" not found in map`);
        }
        return {
          itemId: subStepId,
          ...subStep,
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

function isObject(item: unknown): item is Record<string, unknown> {
  return item !== null && typeof item === "object" && !Array.isArray(item);
}

function deepMerge<T>(target: T, source: DeepPartial<T>): T {
  const result = { ...target };

  for (const key in source) {
    const sourceValue = source[key];
    const targetValue = result[key];

    if (isObject(sourceValue) && isObject(targetValue)) {
      result[key] = deepMerge(
        targetValue,
        sourceValue as DeepPartial<T[Extract<keyof T, string>]>
      );
    } else if (sourceValue !== undefined) {
      result[key] = sourceValue as T[Extract<keyof T, string>];
    }
  }

  return result;
}

export function mergeAnimationState(
  currentState: SimulatorPanelState,
  stateChanges: DeepPartial<SimulatorPanelState>
): SimulatorPanelState {
  return deepMerge(currentState, stateChanges);
}
