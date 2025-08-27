import { createContext } from "react";
import type { NavigationState } from "../types";

export interface NavigationContextValue {
  navigation: NavigationState;
  setNavigation: React.Dispatch<React.SetStateAction<NavigationState>>;
}

export const NavigationContext = createContext<
  NavigationContextValue | undefined
>(undefined);
