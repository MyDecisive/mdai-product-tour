import { useEffect } from "react";
import { selectInTour } from "../contexts/selectors";
import { useHighlander } from "./useHighlander";
import { useSelector } from "./useSelector";

export function useNavButtonHandlers() {
  const { actions } = useHighlander();
  const inTour = useSelector(selectInTour);

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

  return {
    handleNextButtonClick: actions.GO_NEXT_STEP,
    handlePrevButtonClick: actions.GO_PREV_STEP,
    handleResetButtonClick: actions.RESET_ANIMATION,
  };
}
