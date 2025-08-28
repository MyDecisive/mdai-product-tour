import { useCallback, useMemo } from "react";
import { Home, Logs } from "../utils/constants";
import { getViewTitle } from "../utils/strings";
import type { NavigationState, StepItemId, View } from "../utils/types";
import * as HomeContent from "../views/Home/drawerContent";
import * as LogsContent from "../views/Logs/drawerContent";
import { useNavigation } from "./useNavigation";

const drawerContentMap = {
  [Home]: HomeContent.viewTreeItems,
  [Logs]: LogsContent.viewTreeitems,
};

function getViewDrawerItems(view: View) {
  return drawerContentMap[view] || [];
}

const drawerStepOrderMap = {
  [Home]: HomeContent.STEP_ORDER,
  [Logs]: LogsContent.STEP_ORDER,
};

function getViewStepOrder(view: View) {
  return drawerStepOrderMap[view] || [];
}

type DrawerItemClick = (
  event: React.MouseEvent<Element, MouseEvent>,
  itemId: StepItemId
) => void;

export function useGetViewContent() {
  const { view, step, substep, setNavigation } = useNavigation();

  const { drawerItems, drawerHeaderText } = useMemo(() => {
    return {
      drawerItems: getViewDrawerItems(view),
      drawerHeaderText: getViewTitle(view),
    };
  }, [view]);

  const handleBackButtonClick = useCallback(
    () => setNavigation({ view: Home }),
    [setNavigation]
  );

  const handleDrawerItemClick: DrawerItemClick = (_, itemId: StepItemId) => {
    if (drawerItems.find((item) => item.itemId === itemId)) {
      setNavigation({
        view,
        substep,
        step: step === itemId ? undefined : itemId,
      });
    } else {
      setNavigation({
        view,
        step,
        substep: substep === itemId ? undefined : itemId,
      });
    }
  };

  // TODO: Is there a better way to do this part?
  const expandedDrawerItems = [] as string[];
  if (step) {
    expandedDrawerItems.push(step);
    if (substep) {
      expandedDrawerItems.push(substep);
    }
  }

  const handleNextButtonClick = useCallback(() => {
    const nextNavState = deriveNextStepNavState(view, step, substep);
    setNavigation(nextNavState);
  }, [view, step, substep, setNavigation]);

  const handlePrevButtonClick = useCallback(() => {
    const prevNavState = derivePrevStepNavState(view, step, substep);
    setNavigation(prevNavState);
  }, [view, step, substep, setNavigation]);

  return {
    drawerItems,
    drawerHeaderText,
    handleBackButtonClick,
    inTour: view !== Home,
    handleDrawerItemClick,
    expandedDrawerItems,
    handleNextButtonClick,
    handlePrevButtonClick,
  };
}

function deriveNextStepNavState(
  view: View,
  step?: StepItemId,
  subStep?: StepItemId
): NavigationState {
  const stepOrder = getViewStepOrder(view);

  const stepIdx = stepOrder.findIndex(({ stepId }) => stepId === step);
  const { stepId, subStepIds } = stepOrder[stepIdx];

  if (subStepIds && subStepIds.length) {
    const subStepIdx = subStepIds?.findIndex((stepId) => stepId === subStep);

    if (subStepIdx > -1 && subStepIdx < subStepIds.length - 1) {
      const nextSubStepId = subStepIds[subStepIdx + 1];
      return {
        view,
        step: stepId,
        substep: nextSubStepId,
      };
    }
  }

  if (stepIdx < stepOrder.length - 1) {
    const { stepId, subStepIds } = stepOrder[stepIdx + 1];

    return {
      view: view,
      step: stepId,
      ...(subStepIds &&
        subStepIds.length && {
          substep: subStepIds[0],
        }),
    };
  }

  return {
    view: Home,
  };
}

function derivePrevStepNavState(
  view: View,
  step?: StepItemId,
  subStep?: StepItemId
): NavigationState {
  const stepOrder = getViewStepOrder(view);
  const stepIdx = stepOrder.findIndex(({ stepId }) => stepId === step);
  const { subStepIds } = stepOrder[stepIdx];

  if (subStepIds && subStepIds.length) {
    const subStepIdx = subStepIds?.findIndex((stepId) => stepId === subStep);

    if (subStepIdx === 0) {
      if (stepIdx === 0) {
        return {
          view: Home,
        };
      }

      const { stepId: prevStepId, subStepIds: prevSubStepIds } =
        stepOrder[stepIdx - 1];

      return {
        view,
        step: prevStepId,
        ...(prevSubStepIds &&
          prevSubStepIds.length && {
            substep: prevSubStepIds[prevSubStepIds.length - 1],
          }),
      };
    }

    return {
      view,
      step,
      substep: subStepIds[subStepIdx - 1],
    };
  }

  return {
    view: Home,
  };
}
