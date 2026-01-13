import {
  createContext,
  useContext,
  type Dispatch,
  type SetStateAction,
} from "react";
import type {
  AnimationEngineControls,
  AnimationEngineState,
} from "../animationEngine/hook";
import type { TourEngine } from "../utils/engineTypesScratch";
import type { NavigationState } from "../utils/types";

export interface DemoContextValue {
  navigationState: NavigationState;
  setNavState: (navState: Partial<NavigationState>) => void;
  tourConfigs: TourEngine[] | null;
  onAnimationComplete: () => void;
  resetAnimationComplete: () => void;
  animationComplete: boolean;
  loading: boolean;
  error: string | null;
  engineControls: AnimationEngineControls;
  engineState: AnimationEngineState;
  contactModalOpen: boolean;
  setContactModalOpen: Dispatch<SetStateAction<boolean>>;
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
