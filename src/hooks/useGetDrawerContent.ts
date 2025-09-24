import { useEffect } from "react";
import {
  selectDrawerItems,
  selectExpandedDrawerItems,
  selectInTour,
} from "../contexts/selectors";
import type { StepItemId } from "../utils/types";
import { useHighlander } from "./useHighlander";
import { useSelector } from "./useSelector";
import { useNavButtonHandlers } from "./useStepNavButtonHandlers";

type DrawerItemClick = (
  event: React.MouseEvent<Element, MouseEvent>,
  itemId: StepItemId
) => void;

export function useGetDrawerContent() {
  const { actions } = useHighlander();

  const drawerItems = useSelector(selectDrawerItems);
  const expandedDrawerItems = useSelector(selectExpandedDrawerItems);
  const inTour = useSelector(selectInTour);

  const { showPlayButton, nextButtonDisabled } = useNavButtonHandlers();

  const handleDrawerItemClick: DrawerItemClick = (_, itemId: StepItemId) => {
    if (drawerItems.find((item) => item.itemId === itemId)) {
      actions.TOGGLE_STEP(itemId);
    } else {
      actions.TOGGLE_SUB_STEP(itemId);
    }
  };

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

  return {
    inTour,
    drawerItems,
    handleDrawerItemClick,
    expandedDrawerItems,
  };
}
