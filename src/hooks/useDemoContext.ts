import {
  createContext,
  useContext,
  type Dispatch,
  type SetStateAction,
} from "react";
import type { PlayerControls, PlayerState } from "../animationEngine/hook";
import type { Definition, NavigationState } from "../types/steps";

interface DemoContextValue {
  navigationState: NavigationState;
  setNavState: (navState: Partial<NavigationState>) => void;
  tourConfigs: Definition[] | null;
  onAnimationComplete: () => void;
  resetAnimationComplete: () => void;
  animationComplete: boolean;
  loading: boolean;
  error: string | null;
  engineControls: PlayerControls;
  engineState: PlayerState;
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
