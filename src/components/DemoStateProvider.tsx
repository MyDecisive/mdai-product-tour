import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useAnimationEngine } from "../animationEngine/hook.ts";
import { DemoContext } from "../hooks/useDemoContext.ts";
import type { Definition, NavigationState } from "../types/steps.ts";
import { getCurrentEngineData } from "../utils/demoStateHelpers.ts";
import { getAllParsedTourConfigs } from "../utils/fetchTourConfigs.ts";

const defaultNavState: NavigationState = {
  tour: "",
  step: -1,
  subStep: -1,
  bigContentModal: null,
};

export function DemoStateProvider({ children }: { children: ReactNode }) {
  const [tourConfigs, setTourConfigs] = useState<Definition[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [contactModalOpen, setContactModalOpen] = useState<boolean>(false);

  const [navigationState, setNavigationState] =
    useState<NavigationState>(defaultNavState);

  const [animationComplete, setAnimationComplete] = useState<boolean>(false);

  useEffect(() => {
    getAllParsedTourConfigs()
      .then((configs) => {
        setTourConfigs(configs);
        const defaultOpenTourTreeItemIndex = configs.findIndex(
          (c) => c.default_open
        );
        if (defaultOpenTourTreeItemIndex > -1) {
          setNavigationState((old) =>
            Object.assign({}, old, { step: defaultOpenTourTreeItemIndex })
          );
        }
      })
      .catch((err: unknown) => {
        const msg =
          err instanceof Error ? err.message : "Failed to load tour configs";

        setError(msg);
      })
      .finally(() => setLoading(false));
  }, []);

  const setNavState = useCallback((newNavState: Partial<NavigationState>) => {
    setNavigationState((current) => Object.assign({}, current, newNavState));
  }, []);

  const currentEngineData = useMemo(() => {
    return getCurrentEngineData(
      navigationState.tour,
      tourConfigs,
      navigationState.step,
      navigationState.subStep
    );
  }, [
    navigationState.tour,
    tourConfigs,
    navigationState.step,
    navigationState.subStep,
  ]);

  const onAnimationComplete = useCallback(() => {
    setAnimationComplete(true);
  }, []);

  const resetAnimationComplete = useCallback(() => {
    setAnimationComplete(false);
  }, []);

  const [engineState, engineControls] = useAnimationEngine(
    currentEngineData.targetState,
    currentEngineData.animation,
    currentEngineData.prevTargetState,
    onAnimationComplete
  );

  const contextValue = useMemo(() => {
    return {
      navigationState,
      tourConfigs,
      setNavState,
      setAnimationComplete,
      animationComplete,
      loading,
      error,
      onAnimationComplete,
      resetAnimationComplete,
      engineState,
      engineControls,
      contactModalOpen,
      setContactModalOpen,
    };
  }, [
    onAnimationComplete,
    resetAnimationComplete,
    navigationState,
    tourConfigs,
    setNavState,
    animationComplete,
    loading,
    error,
    engineState,
    engineControls,
    contactModalOpen,
    setContactModalOpen,
  ]);

  return (
    <DemoContext.Provider value={contextValue}>{children}</DemoContext.Provider>
  );
}
