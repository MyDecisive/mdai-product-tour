import { Logs } from "../utils/constants";
import type {
  SimulatorPanelState,
  AnimationAction,
  StepDefinition,
  View,
  StepItemId,
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

export function getPanelContent(
  view: View,
  step?: StepItemId,
  subStep?: StepItemId
) {
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
