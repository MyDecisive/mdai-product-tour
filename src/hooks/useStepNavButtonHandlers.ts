import { useEffect, useMemo } from "react";
import { selectAnimationIndex } from "../contexts/selectors";
import { useGetPanelContent } from "./useGetPanelContent";
import { useHighlander } from "./useHighlander";
import { useSelector } from "./useSelector";

export function useNavButtonHandlers() {
  const { actions } = useHighlander();
  const animationIndex = useSelector(selectAnimationIndex);
  const {
    panelState: { isShowingPreviousContent, animations },
    inTour,
  } = useGetPanelContent();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (inTour) {
        if (e.key === "ArrowRight") {
          e.preventDefault();
          actions.GO_NEXT_STEP();
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
  }, [actions, inTour]);

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

  return {
    isShowingPreviousContent,
    showPlayButton,
    handleClickPlay: actions.BEGIN_ANIMATION,
    handleNextButtonClick: actions.GO_NEXT_STEP,
    handlePrevButtonClick: actions.GO_PREV_STEP,
    handleResetButtonClick: actions.RESET_ANIMATION,
    nextButtonDisabled,
  };
}
