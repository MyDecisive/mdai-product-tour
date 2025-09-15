import { Logs } from "../utils/constants";
import type {
  AnimationAction,
  NavigationState,
  SimulatorPanelState,
  StepDefinition,
} from "../utils/types";
import * as LogsPanelContent from "../views/Logs/simsContent";
import { getViewStepOrder } from "./allViewsDrawerContent";

const panelContentMap = {
  [Logs]: LogsPanelContent.PANEL_STATE,
};

export function createEmptySimulatorPanelState(): SimulatorPanelState {
  return {
    config: null,
    terminal: null,
    status: null,
    logs: null,
  };
}

function createEmptyPanelContentState() {
  return {
    animations: [] as AnimationAction[],
    initialState: createEmptySimulatorPanelState(),
  } as StepDefinition;
}

export function getPanelContent({ view, step, subStep }: NavigationState) {
  const viewContentMap = panelContentMap[view];
  if (!viewContentMap || !step || !subStep) {
    return {
      ...createEmptyPanelContentState(),
      isShowingPreviousContent: false,
    };
  }

  const subStepContent = viewContentMap[subStep];
  if (subStepContent) {
    return {
      ...subStepContent,
      isShowingPreviousContent: false,
    };
  }

  const stepOrder = getViewStepOrder(view);
  const currentStepIndex = stepOrder.findIndex((s) => s.stepId === step);

  if (currentStepIndex === -1) {
    return {
      ...createEmptyPanelContentState(),
      isShowingPreviousContent: false,
    };
  }

  const currentStep = stepOrder[currentStepIndex];
  const currentSubStepIndex = (currentStep?.subStepIds || []).indexOf(subStep);

  for (let stepIdx = currentStepIndex; stepIdx >= 0; stepIdx--) {
    const stepItem = stepOrder[stepIdx];
    const subStepIds = stepItem.subStepIds || [];
    const startSubIdx =
      stepIdx === currentStepIndex
        ? currentSubStepIndex - 1
        : subStepIds.length - 1;

    for (let subIdx = startSubIdx; subIdx >= 0; subIdx--) {
      const candidateSubStep = subStepIds[subIdx];
      const candidateContent = viewContentMap[candidateSubStep];

      if (candidateContent) {
        return {
          ...candidateContent,
          isShowingPreviousContent: true,
        };
      }
    }
  }

  return {
    ...createEmptyPanelContentState(),
    isShowingPreviousContent: false,
  };
}
