import { useMemo } from "react";
import { getViewTitle } from "../utils/strings";
import type { StepItemId } from "../utils/types";
import { getViewDrawerItems } from "../views/allViewsDrawerContent";
import { useNavigation } from "./useNavigation";

type DrawerItemClick = (
  event: React.MouseEvent<Element, MouseEvent>,
  itemId: StepItemId
) => void;

export function useGetDrawerContent() {
  const { view, step, subStep, setNavigation } = useNavigation();

  const { drawerItems, drawerHeaderText } = useMemo(() => {
    return {
      drawerItems: getViewDrawerItems(view),
      drawerHeaderText: getViewTitle(view),
    };
  }, [view]);

  const handleDrawerItemClick: DrawerItemClick = (_, itemId: StepItemId) => {
    if (drawerItems.find((item) => item.itemId === itemId)) {
      setNavigation({
        view,
        subStep,
        step: step === itemId ? undefined : itemId,
      });
    } else {
      setNavigation({
        view,
        step,
        subStep: subStep === itemId ? undefined : itemId,
      });
    }
  };

  // TODO: Is there a better way to do this part?
  const expandedDrawerItems = [] as string[];
  if (step) {
    expandedDrawerItems.push(step);
    if (subStep) {
      expandedDrawerItems.push(subStep);
    }
  }

  return {
    drawerItems,
    drawerHeaderText,
    handleDrawerItemClick,
    expandedDrawerItems,
  };
}
