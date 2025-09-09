import { Home, Logs } from "../utils/constants";
import type {
  AnimationAction,
  StepDefinition,
  StepItemId,
  View,
} from "../utils/types";
import * as HomeDrawerContent from "../views/Home/drawerContent";
import * as LogsDrawerContent from "../views/Logs/drawerContent";
import * as LogsPanelContent from "../views/Logs/simsContent";
import { createEmptySimulatorPanelState } from "./common";

const drawerContentMap = {
  [Home]: HomeDrawerContent.viewTreeItems,
  [Logs]: LogsDrawerContent.viewTreeitems,
};

export function getViewDrawerItems(view: View) {
  return drawerContentMap[view] || [];
}

const drawerStepOrderMap = {
  [Home]: HomeDrawerContent.STEP_ORDER,
  [Logs]: LogsDrawerContent.STEP_ORDER,
};

export function getViewStepOrder(view: View) {
  return drawerStepOrderMap[view] || [];
}

const panelContentMap = {
  [Logs]: LogsPanelContent.PANEL_STATE,
};

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
