import {
  selectDrawerItems,
  selectExpandedDrawerItems,
  selectInTour,
} from "../contexts/selectors";
import type { StepItemId } from "../utils/types";
import { useHighlander } from "./useHighlander";
import { useSelector } from "./useSelector";

type DrawerItemClick = (
  event: React.MouseEvent<Element, MouseEvent>,
  itemId: StepItemId
) => void;

export function useGetDrawerContent() {
  const { actions } = useHighlander();

  const drawerItems = useSelector(selectDrawerItems);
  const expandedDrawerItems = useSelector(selectExpandedDrawerItems);
  const inTour = useSelector(selectInTour);

  const handleDrawerItemClick: DrawerItemClick = (_, itemId: StepItemId) => {
    if (drawerItems.find((item) => item.itemId === itemId)) {
      actions.TOGGLE_STEP(itemId);
    } else {
      actions.TOGGLE_SUB_STEP(itemId);
    }
  };

  return {
    inTour,
    drawerItems,
    handleDrawerItemClick,
    expandedDrawerItems,
  };
}
