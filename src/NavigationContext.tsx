import { createContext, type ReactNode, useContext, useState } from "react";
import { Home } from "./constants";
import type { View } from "./types";

export interface NavigationState {
  view: View;
  step?: string;
  substep?: string;
}

interface NavigationContextValue {
  navigation: NavigationState;
  setNavigation: (navigation: NavigationState) => void;
  updateNavigation: (updates: Partial<NavigationState>) => void;
}

const NavigationContext = createContext<NavigationContextValue | undefined>(
  undefined
);

interface NavigationProviderProps {
  children: ReactNode;
  initialState?: NavigationState;
}

export function NavigationProvider({
  children,
  initialState = { view: Home },
}: NavigationProviderProps) {
  const [navigation, setNavigation] = useState<NavigationState>(initialState);

  const updateNavigation = (updates: Partial<NavigationState>) => {
    setNavigation((prev) => ({ ...prev, ...updates }));
  };

  const value: NavigationContextValue = {
    navigation,
    setNavigation,
    updateNavigation,
  };

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);

  if (context === undefined) {
    throw new Error("useNavigation must be used within a NavigationProvider");
  }

  return context;
}

export function useCurrentView() {
  const { navigation, updateNavigation } = useNavigation();

  return {
    view: navigation.view,
    setView: (view: string) => updateNavigation({ view }),
  };
}

export function useCurrentStep() {
  const { navigation, updateNavigation } = useNavigation();

  return {
    step: navigation.step,
    setStep: (step: string) => updateNavigation({ step }),
  };
}

export function useCurrentSubstep() {
  const { navigation, updateNavigation } = useNavigation();

  return {
    substep: navigation.substep,
    setSubstep: (substep: string) => updateNavigation({ substep }),
  };
}
