import { Logs, PII, Traces } from "../utils/constants";
import type {
  SimScript,
  SimulatorPanelState,
  StepItemMap,
  ViewStepOrder,
  ViewTreeItemProps,
} from "../utils/types";

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

export const simScripts = new Map<string, SimScript>();

export function registerSims(view: string, sims: Record<string, SimScript>) {
  Object.entries(sims).forEach(([subStep, script]) => {
    simScripts.set(`${view}/${subStep}`, script);
  });
}

export function getSimScriptKey(view: string, step?: string, subStep?: string) {
  return subStep ? `${view}/${subStep}` : step ? `${view}/${step}` : view;
}

export function selectSimScript(key: string): SimScript | undefined {
  return simScripts.get(key);
}

export function createEmptySimulatorPanelState(): SimulatorPanelState {
  return {
    config: null,
    terminal: null,
    status: null,
    logs: null,
  };
}

export const TERMINAL_PROMPT = "eng@local-terminal > ";
export const CURSOR_CHAR = "█";

export const DEFAULT_ANIMATION_STEP_DURATION = 750;

function isObject(item: unknown): item is Record<string, unknown> {
  return item !== null && typeof item === "object" && !Array.isArray(item);
}

function deepMerge<T>(target: T, source: Partial<T>): T {
  const result = { ...target };

  for (const key in source) {
    const sourceValue = source[key];
    const targetValue = result[key];

    if (isObject(sourceValue) && isObject(targetValue)) {
      result[key] = deepMerge(
        targetValue,
        sourceValue as Partial<T[Extract<keyof T, string>]>
      ) as T[Extract<keyof T, string>];
    } else if (sourceValue !== undefined) {
      result[key] = sourceValue as T[Extract<keyof T, string>];
    }
  }

  return result;
}

export function mergeAnimationState(
  currentState: SimulatorPanelState,
  stateChanges: Partial<SimulatorPanelState>
): SimulatorPanelState {
  return deepMerge(currentState, stateChanges);
}
