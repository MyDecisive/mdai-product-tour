import { useCallback, useMemo } from "react";
import type { EngineSubStep, TourEngine } from "../utils/engineTypesScratch";
import type { NavigationState } from "../utils/types";
import { useDemoContext } from "./useDemoContext";

export function useNavButtonHandlers() {
  const {
    tourConfigs,
    setNavState,
    resetAnimationComplete,
    animationComplete,
    navigationState,
    engineControls,
    engineState,
  } = useDemoContext();

  const currentSubStep = useMemo(() => {
    return findCurrentSubStep(tourConfigs, navigationState);
  }, [tourConfigs, navigationState]);

  const hasAnimations = useMemo(() => {
    return !!currentSubStep && (currentSubStep.animation || [])?.length > 0;
  }, [currentSubStep]);

  const showPlayButton = useMemo(() => {
    return hasAnimations && !animationComplete;
  }, [hasAnimations, animationComplete]);

  const nextButtonDisabled = useMemo(() => {
    return hasAnimations && engineState.isPlaying;
  }, [hasAnimations, engineState.isPlaying]);

  const nextButtonText = useMemo(() => {
    if (!currentSubStep || !currentSubStep.nextSubStep.bigContentModal) {
      return "Next";
    }
    return "See Results";
  }, [currentSubStep]);

  const hidePrevButton = useMemo(() => {
    return navigationState.subStep === 0 && navigationState.step === 0;
  }, [navigationState]);

  const handleClickPlay = engineControls.play;

  const handleResetButtonClick = useCallback(() => {
    resetAnimationComplete();
    engineControls.reset();
  }, [engineControls, resetAnimationComplete]);

  const handleNextButtonClick = useCallback(() => {
    if (!currentSubStep) return;
    setNavState(currentSubStep.nextSubStep);
    resetAnimationComplete();
  }, [currentSubStep, setNavState, resetAnimationComplete]);

  const handlePrevButtonClick = useCallback(() => {
    if (!currentSubStep) return;
    setNavState(currentSubStep.previousSubStep);
  }, [currentSubStep, setNavState]);

  return {
    isShowingPreviousContent: !hasAnimations, // when the current subStep doesn't have animations
    showPlayButton,
    nextButtonText,
    handleClickPlay,
    handleNextButtonClick,
    handlePrevButtonClick,
    handleResetButtonClick,
    nextButtonDisabled,
    hidePrevButton,
  };
}

function findCurrentSubStep(
  tourConfigs: TourEngine[] | null,
  { tour, step, subStep }: NavigationState
): EngineSubStep | null {
  if (!tourConfigs) {
    return null;
  }

  const currentTour = tourConfigs.find((t) => t.id === tour);
  if (!currentTour || step === -1 || subStep === -1) {
    return null;
  }

  const currentStep = currentTour.steps[step];
  const currentSubStep = currentStep.subSteps[subStep];

  return currentSubStep;
}
