import { Logs } from "../utils/constants";
import type {
  AnimationAction,
  NavigationState,
  SimulatorPanelState,
  StepDefinition,
} from "../utils/types";
import * as LogsPanelContent from "../views/Logs/simsContent";

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
    return createEmptyPanelContentState();
  }

  const subStepContent = viewContentMap[subStep];
  if (!subStepContent) {
    return createEmptyPanelContentState();
  }

  return subStepContent;
}
