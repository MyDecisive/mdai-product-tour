import { useMemo } from "react";
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
  } = useGetPanelContent();

  const { showPlayButton, nextButtonDisabled } = useMemo(() => {
    const hasAnimations = !isShowingPreviousContent && !!animations.length;
    const showPlayButton = hasAnimations && animationIndex === -1;
    const animationPlaying = animationIndex < animations.length - 1;
    const nextButtonDisabled = !!subStep && hasAnimations && animationPlaying;
    return {
      showPlayButton,
      nextButtonDisabled,
    };
  }, [animations, animationIndex, isShowingPreviousContent, subStep]);

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
