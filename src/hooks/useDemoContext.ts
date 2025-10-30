import { createContext, useContext } from "react";
import type {
  AnimationEngineState,
  AnimationEngineControls,
} from "../animationEngine/hook";
import type { NavigationState } from "../utils/types";

export interface DemoConfig {
  animationEngineState: AnimationEngineState;
  animationEngineControls: AnimationEngineControls;
  navigationState: NavigationState;
  loadingState: boolean;
  errorState: string | null;
}

export const DemoContext = createContext<DemoConfig | undefined>(undefined);

export const useDemoContext = () => {
  const demoItems = useContext(DemoContext);
  if (!demoItems) {
    throw new Error("useDemoContext must be used within a DemoProvider");
  }
  return demoItems;
};
