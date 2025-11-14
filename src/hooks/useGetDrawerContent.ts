import { useCallback, useEffect, useMemo, type MouseEvent } from "react";
import {
  createDrawerItems,
  createExpandedDrawerItemIds,
  onTreeItemClick,
} from "../utils/demoStateHelpers";
import { useDemoContext } from "./useDemoContext";
import { useNavButtonHandlers } from "./useStepNavButtonHandlers";

export function useGetDrawerContent() {
  const {
    tourConfigs,
    setNavState,
    navigationState: { tour, step, subStep },
  } = useDemoContext();

  const inTour = tour !== "";

  const selectTour = useCallback(
    (tourId: string) => {
      setNavState({
        tour: tourId,
        step: 0,
        subStep: 0,
      });
    },
    [setNavState]
  );

  const drawerItems = useMemo(() => {
    return createDrawerItems(selectTour, tourConfigs, tour);
  }, [selectTour, tourConfigs, tour]);

  const currentDrawerItem = useMemo(() => {
    const selectedTour = tourConfigs?.find((t) => t.id === tour);
    if (!selectedTour || step === -1 || subStep === -1) return undefined;

    const selectedStep = selectedTour.steps[step];
    const selectedSubStep = selectedStep.subSteps[subStep];

    return selectedSubStep;
  }, [tour, tourConfigs, step, subStep]);

  const expandedDrawerItemIds = useMemo(() => {
    return createExpandedDrawerItemIds(
      step,
      subStep,
      !!currentDrawerItem?.visualizationModal
    );
  }, [step, subStep, currentDrawerItem]);

  const handleTreeItemClick = useCallback(
    (_: MouseEvent, stepId: string) => {
      onTreeItemClick(stepId, step, subStep, setNavState);
    },
    [step, subStep, setNavState]
  );

  const {
    showPlayButton,
    nextButtonDisabled,
    handleClickPlay,
    handleNextButtonClick,
    handlePrevButtonClick,
  } = useNavButtonHandlers();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (inTour) {
        if (e.key === "ArrowRight") {
          e.preventDefault();
          if (showPlayButton) {
            handleClickPlay();
            return;
          }
          if (!nextButtonDisabled) {
            handleNextButtonClick();
          }
        } else if (e.key === "ArrowLeft") {
          e.preventDefault();
          handlePrevButtonClick();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    inTour,
    showPlayButton,
    nextButtonDisabled,
    handleClickPlay,
    handleNextButtonClick,
    handlePrevButtonClick,
  ]);

  return {
    inTour,
    drawerItems,
    handleTreeItemClick,
    expandedDrawerItemIds,
    // visualization steps
    currentDrawerItem,
    handleNextButtonClick,
    handlePrevButtonClick,
  };
}
