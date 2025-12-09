import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useAnimationEngine } from "../animationEngine/hook.ts";
import { DemoContext } from "../hooks/useDemoContext.ts";
import { getCurrentEngineData } from "../utils/demoStateHelpers.ts";
import type { TourEngine } from "../utils/engineTypesScratch.ts";
import type { NavigationState } from "../utils/types.ts";
import { getAllParsedTourConfigs } from "../utils/fetchTourConfigs.ts";

interface DemoStateProviderProps {
  children: ReactNode;
}

const defaultNavState: NavigationState = {
  tour: "",
  step: -1,
  subStep: -1,
  bigContentModal: null,
};

export function DemoStateProvider({ children }: DemoStateProviderProps) {
  const [tourConfigs, setTourConfigs] = useState<TourEngine[] | null>(null);
  const [loadingState, setLoadingState] = useState<boolean>(true);
  const [errorState, setErrorState] = useState<string | null>(null);

  const [navigationState, setNavigationState] =
    useState<NavigationState>(defaultNavState);

  const [animationComplete, setAnimationComplete] = useState<boolean>(false);

  useEffect(() => {
    setLoadingState(true);
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
        // TODO: Handle error state in App.tsx (loading state too)
        const msg =
          err instanceof Error ? err.message : "Failed to load config";

        setErrorState(msg);
      })
      .finally(() => setLoadingState(false));
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
      loadingState,
      errorState,
      onAnimationComplete,
      resetAnimationComplete,
      engineState,
      engineControls,
    };
  }, [
    onAnimationComplete,
    resetAnimationComplete,
    navigationState,
    tourConfigs,
    setNavState,
    animationComplete,
    loadingState,
    errorState,
    engineState,
    engineControls,
  ]);

  return (
    <DemoContext.Provider value={contextValue}>{children}</DemoContext.Provider>
  );
}
