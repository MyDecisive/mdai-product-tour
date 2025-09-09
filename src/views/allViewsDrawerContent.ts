import { Home, Logs } from "../utils/constants";
import type { View } from "../utils/types";
import * as HomeDrawerContent from "./Home/drawerContent";
import * as LogsDrawerContent from "./Logs/drawerContent";

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
