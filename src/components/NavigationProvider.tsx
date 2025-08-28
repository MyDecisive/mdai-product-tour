import { type ReactNode, useState } from "react";
import {
  NavigationContext,
  type NavigationContextValue,
} from "../contexts/navigation";
import { Home } from "../utils/constants";
import type { NavigationState } from "../utils/types";

interface NavigationProviderProps {
  children: ReactNode;
  initialState?: NavigationState;
}

export function NavigationProvider({
  children,
  initialState = { view: Home },
}: NavigationProviderProps) {
  const [navigation, setNavigation] = useState<NavigationState>(initialState);

  const value: NavigationContextValue = {
    navigation,
    setNavigation,
  };

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
}
