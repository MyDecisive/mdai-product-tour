import { useEffect, useMemo } from "react";
import { stepVizMap } from "../components/BigContentModal/StepResults";
import { selectAnimationIndex, selectNavigation } from "../contexts/selectors";
import { useGetPanelContent } from "./useGetPanelContent";
import { useHighlander } from "./useHighlander";
import { useSelector } from "./useSelector";

export function useNavButtonHandlers() {
  const { actions } = useHighlander();
  const animationIndex = useSelector(selectAnimationIndex);
  const { subStep } = useSelector(selectNavigation);
  const {
    panelState: { isShowingPreviousContent, animations },
    inTour,
  } = useGetPanelContent();

  const { showPlayButton, nextButtonDisabled } = useMemo(() => {
    const hasAnimations = !isShowingPreviousContent && !!animations.length;
    const showPlayButton = hasAnimations && animationIndex === -1;
    const animationPlaying = animationIndex < animations.length - 1;
    const nextButtonDisabled = hasAnimations && animationPlaying;
    return {
      showPlayButton,
      nextButtonDisabled,
    };
  }, [animations, animationIndex, isShowingPreviousContent]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (inTour) {
        if (e.key === "ArrowRight") {
          e.preventDefault();
          if (showPlayButton) {
            actions.BEGIN_ANIMATION();
            return;
          }
          if (!nextButtonDisabled) {
            actions.GO_NEXT_STEP();
          }
        } else if (e.key === "ArrowLeft") {
          e.preventDefault();
          actions.GO_PREV_STEP();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [actions, inTour, showPlayButton, nextButtonDisabled]);

  const nxtBtnTxt = useMemo(() => {
    if (
      subStep &&
      Object.keys(stepVizMap).includes(subStep as keyof typeof stepVizMap)
    ) {
      return "See results";
    }
    return "Next";
  }, [subStep]);

  return {
    isShowingPreviousContent,
    showPlayButton,
    nextButtonText: nxtBtnTxt,
    handleClickPlay: actions.BEGIN_ANIMATION,
    handleNextButtonClick: actions.GO_NEXT_STEP,
    handlePrevButtonClick: actions.GO_PREV_STEP,
    handleResetButtonClick: actions.RESET_ANIMATION,
    nextButtonDisabled,
  };
}
