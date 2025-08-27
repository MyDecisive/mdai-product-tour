import { type ReactNode, useState } from "react";
import { Home } from "./constants";
import {
  NavigationContext,
  type NavigationContextValue,
} from "./contexts/navigation";
import type { NavigationState } from "./types";

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
