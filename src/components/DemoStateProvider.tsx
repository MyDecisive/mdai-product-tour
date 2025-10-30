import {
  useMemo,
  useEffect,
  useState,
  type ReactNode,
  useCallback,
} from "react";
import { DemoContext } from "../hooks/useDemoContext.ts";
import type { DrawerConfig } from "../utils/drawerTypes.ts";
import { useAnimationEngine } from "../animationEngine/hook.ts";
import drawerTours from "../views/drawer-config.yaml?raw";
import { parseYaml } from "../utils/loadTourConfigs.ts";

interface DemoStateProviderProps {
  children: ReactNode;
}

export function DemoStateProvider({ children }: DemoStateProviderProps) {
  const [drawerConfig, setDrawerConfig] = useState<DrawerConfig | null>(null);
  const [tour, setTour] = useState("");
  const [step, setStep] = useState(-1);
  const [subStep, setSubStep] = useState(-1);
  const [loadingState, setLoadingState] = useState<boolean>(true);
  const [errorState, setErrorState] = useState<string | null>(null);

  //   useEffect(() => {
  //     loadAllDrawerConfigs()
  //       .then(setDrawerConfig)
  //       .catch((err: unknown) => {
  //         const msg =
  //           err instanceof Error ? err.message : "Failed to load config";
  //         setError(msg);
  //       })
  //       .finally(() => setLoading(false));
  //   }, []);

  useEffect(() => {
    const parsedConfig = parseYaml(drawerTours);
    setDrawerConfig(parsedConfig as DrawerConfig);
    setLoadingState(false);
    setErrorState(null);
  }, []);

  const onTourSelect = (selectedTour: string) => {
    setTour(selectedTour);
    setStep(-1);
    setSubStep(-1);
  };

  const expandedDrawerItems = useMemo(() => {
    const expanded = [];
    if (step !== -1) {
      expanded.push(`${step}`);
    }
    if (subStep !== -1) {
      expanded.push(`${step}-${subStep}`);
    }
    return expanded;
  }, [step, subStep]);

  const drawerItems = useMemo(() => {
    if (!tour) {
      return (
        drawerConfig?.tours.map((tour) => ({
          id: tour.id,
          title: tour.title,
          subtitle: tour.subtitle,
          coming_soon: tour.coming_soon,
          buttonText: tour.buttonText,
          ...(!tour.coming_soon
            ? { onTourSelect: () => onTourSelect(tour.id) }
            : {}),
        })) || []
      );
    } else {
      const selectedTour = drawerConfig?.tours.find((t) => t.id === tour);
      if (!selectedTour) return [];
      return (
        selectedTour?.steps?.map((step) => ({
          id: step.id,
          title: step.title,
          substeps: step.substeps?.filter((ss) => !ss.visualizationModal),
        })) || []
      );
    }
  }, [drawerConfig, tour]);

  const handleTreeItemClick = useCallback(
    (_: never, stepId: string) => {
      const [stepIndexString, subStepIndexString] = stepId.split("-");
      const selectedStepIndex = parseInt(stepIndexString);
      if (subStepIndexString !== undefined) {
        const selectedSubStepIndex = parseInt(subStepIndexString);
        const isToggle = selectedSubStepIndex === subStep;
        setSubStep(isToggle ? -1 : selectedSubStepIndex);
        return;
      }
      const isToggle = selectedStepIndex === step;
      setStep(isToggle ? -1 : selectedStepIndex);
    },
    [step, subStep]
  );

  const [animationEngineState, animationEngineControls] = useAnimationEngine(
    {},
    [],
    {},
    () => {}
  );

  const contextValue = useMemo(() => {
    return {
      navigationState: {
        tour,
        step: step.toString(),
        subStep: subStep.toString(),
      },
      animationEngineState,
      animationEngineControls,
      loadingState,
      errorState,
      drawerItems,
      expandedDrawerItems,
      handleTreeItemClick,
    };
  }, [
    tour,
    step,
    subStep,
    animationEngineControls,
    animationEngineState,
    loadingState,
    errorState,
    drawerItems,
    expandedDrawerItems,
    handleTreeItemClick,
  ]);

  return (
    <DemoContext.Provider value={contextValue}>{children}</DemoContext.Provider>
  );
}
