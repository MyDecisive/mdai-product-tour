import { createContext, useContext } from "react";
import type {
  AnimationEngineState,
  AnimationEngineControls,
} from "../animationEngine/hook";
import type { NavigationState } from "../utils/types";

export interface DemoContextValue {
  navigationState: NavigationState;
  animationEngineState: AnimationEngineState;
  animationEngineControls: AnimationEngineControls;
  loadingState: boolean;
  errorState: string | null;
  expandedDrawerItems: string[];
  handleTreeItemClick: (event: never, id: string) => void;
}

export const DemoContext = createContext<DemoContextValue | undefined>(
  undefined
);

export const useDemoContext = () => {
  const demoItems = useContext(DemoContext);
  if (!demoItems) {
    throw new Error("useDemoContext must be used within a DemoProvider");
  }
  return demoItems;
};
