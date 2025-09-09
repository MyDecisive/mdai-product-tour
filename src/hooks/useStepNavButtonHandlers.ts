import { useCallback } from "react";

import { Home } from "../utils/constants";
import type { NavigationState, StepItemId, View } from "../utils/types";
import { getViewStepOrder } from "../views/content";
import { useAnimationIndex } from "./useAnimationIndex";
import { useNavigation } from "./useNavigation";

export function useNavButtonHandlers() {
  const { view, step, subStep, setNavigation } = useNavigation();

  const { resetAnimations } = useAnimationIndex();

  const handleBackButtonClick = useCallback(
    () => setNavigation({ view: Home, step: view }),
    [setNavigation, view]
  );

  const handleNextButtonClick = useCallback(() => {
    const nextNavState = deriveNextStepNavState(view, step, subStep);
    setNavigation(nextNavState);
  }, [view, step, subStep, setNavigation]);

  const handlePrevButtonClick = useCallback(() => {
    const prevNavState = derivePrevStepNavState(view, step, subStep);
    setNavigation(prevNavState);
  }, [view, step, subStep, setNavigation]);

  return {
    handleBackButtonClick,
    handleNextButtonClick,
    handlePrevButtonClick,
    handleResetButtonClick: resetAnimations,
  };
}

function deriveNextStepNavState(
  view: View,
  step?: StepItemId,
  subStep?: StepItemId
): NavigationState {
  const stepOrder = getViewStepOrder(view);

  if (!step) {
    return {
      view,
      step: stepOrder[0].stepId,
      ...(stepOrder[0].subStepIds && {
        subStep: stepOrder[0].subStepIds[0],
      }),
    };
  }
  const stepIdx = stepOrder.findIndex(({ stepId }) => stepId === step);
  const { stepId, subStepIds } = stepOrder[stepIdx];

  if (!subStep) {
    return {
      view,
      step: stepId,
      subStep: subStepIds?.[0],
    };
  }

  if (subStepIds && subStepIds.length) {
    const subStepIdx = subStepIds?.findIndex((stepId) => stepId === subStep);

    if (subStepIdx > -1 && subStepIdx < subStepIds.length - 1) {
      const nextSubStepId = subStepIds[subStepIdx + 1];
      return {
        view,
        step: stepId,
        subStep: nextSubStepId,
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
          subStep: subStepIds[0],
        }),
    };
  }

  return {
    view: Home,
    bigContentModal: "finished",
  };
}

function derivePrevStepNavState(
  view: View,
  step?: StepItemId,
  subStep?: StepItemId
): NavigationState {
  const stepOrder = getViewStepOrder(view);

  if (!step) {
    return {
      view,
      step: stepOrder[stepOrder.length - 1].stepId,
      subStep: stepOrder[stepOrder.length - 1].subStepIds
        ? stepOrder[stepOrder.length - 1].subStepIds?.[
            stepOrder[stepOrder.length - 1].subStepIds!.length - 1
          ]
        : undefined,
    };
  }

  const stepIdx = stepOrder.findIndex(({ stepId }) => stepId === step);
  const { subStepIds } = stepOrder[stepIdx];

  if (!subStep) {
    return {
      view,
      step,
      subStep: subStepIds ? subStepIds[subStepIds?.length - 1] : undefined,
    };
  }

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
            subStep: prevSubStepIds[prevSubStepIds.length - 1],
          }),
      };
    }

    return {
      view,
      step,
      subStep: subStepIds[subStepIdx - 1],
    };
  }

  return {
    view: Home,
  };
}
