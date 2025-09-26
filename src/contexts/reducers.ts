import { Home, ITEM_IDS, LOGS_DEFAULT_STEPS } from "../utils/constants";
import type { NavigationState, TourState } from "../utils/types";
import { getViewStepOrder } from "../views/allViewsDrawerContent";
import { getPanelContent } from "../views/allViewsPanelContent";
import { ACTION_TYPES } from "./constants";
import type { AppAction, PayloadMap, ReducerFunction } from "./types";

const reducerFunctions = {
  [ACTION_TYPES.BEGIN_ANIMATION]: (state) => ({
    ...state,
    animationIndex: 0,
  }),
  [ACTION_TYPES.RESET_ANIMATION]: (state) => ({
    ...state,
    animationIndex: -1,
  }),
  [ACTION_TYPES.INCREMENT_ANIMATION]: (state) => ({
    ...state,
    animationIndex: state.animationIndex + 1,
  }),
  [ACTION_TYPES.SET_ANIMATION_INDEX]: (state, action) => ({
    ...state,
    animationIndex: action.payload,
  }),
  [ACTION_TYPES.GO_BACK]: (state) => {
    return {
      navigation: {
        view: Home,
        step: state.navigation.view,
      },
      animationIndex: -1,
    };
  },

  [ACTION_TYPES.GO_NEXT_STEP]: (state) => {
    const nextNavState = deriveNextStepNavState(state.navigation);

    return {
      ...state,
      navigation: nextNavState,
      animationIndex: deriveAnimationIndexFromNewNextStepNavState(nextNavState),
    };
  },

  [ACTION_TYPES.GO_PREV_STEP]: (state) => {
    const newNavState = derivePrevStepNavState(state.navigation);
    const animationIndex =
      deriveAnimationIndexFromNewPrevStepNavState(newNavState);
    return {
      ...state,
      navigation: newNavState,
      animationIndex,
    };
  },

  [ACTION_TYPES.SET_NAVIGATION]: (state, action) => ({
    ...state,
    ...action.payload,
    animationIndex: -1,
  }),

  [ACTION_TYPES.TOGGLE_STEP]: (state, action) => ({
    ...state,
    navigation: {
      ...state.navigation,
      step:
        action.payload === state.navigation.step ? undefined : action.payload,
      subStep: undefined,
    },
    animationIndex: -1,
  }),

  [ACTION_TYPES.TOGGLE_SUB_STEP]: (state, action) => ({
    ...state,
    navigation: {
      ...state.navigation,
      subStep:
        action.payload === state.navigation.subStep
          ? undefined
          : action.payload,
    },
    animationIndex: -1,
  }),
  [ACTION_TYPES.OPEN_BIG_CONTENT_MODAL]: (state, action) => ({
    ...state,
    navigation: {
      ...state.navigation,
      bigContentModal: action.payload,
    },
  }),
  [ACTION_TYPES.CLOSE_BIG_CONTENT_MODAL]: (state) => ({
    ...state,
    navigation: {
      ...state.navigation,
      bigContentModal: undefined,
    },
  }),
  [ACTION_TYPES.START_LOGS_DEMO]: (state) => ({
    ...state,
    navigation: LOGS_DEFAULT_STEPS,
  }),
  [ACTION_TYPES.SET_ACTIVE_TAB]: (state, { payload }) => ({
    ...state,
    activeTab: payload,
  }),
} as const satisfies {
  [K in keyof PayloadMap]: ReducerFunction<K>;
};

export function reducer(state: TourState, action: AppAction): TourState {
  const handler = reducerFunctions[action.type] as ReducerFunction<
    typeof action.type
  >;
  return handler(state, action);
}

function deriveNextStepNavState({
  view,
  step,
  subStep,
  bigContentModal,
}: NavigationState): NavigationState {
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

    if (subStepIdx > -1) {
      if (subStepIdx < subStepIds.length - 1) {
        const nextSubStepId = subStepIds[subStepIdx + 1];
        return {
          view,
          step: stepId,
          subStep: nextSubStepId,
        };
      }
      if (step !== ITEM_IDS.introduction && !bigContentModal) {
        return {
          view,
          step,
          subStep,
          bigContentModal: "results",
        };
      }

      if (bigContentModal === "results") {
        if (subStep === ITEM_IDS.step3_take && step === ITEM_IDS.step3) {
          return {
            view: Home,
            bigContentModal: "finished",
          };
        }
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

function derivePrevStepNavState({
  view,
  step,
  subStep,
  bigContentModal,
}: NavigationState): NavigationState {
  const stepOrder = getViewStepOrder(view);

  if (bigContentModal === "results") {
    return {
      view,
      step,
      subStep,
    };
  }

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

function deriveAnimationIndexFromNewPrevStepNavState(
  navState: NavigationState
): number {
  const panelContent = getPanelContent(navState);

  return panelContent.animations ? panelContent.animations.length - 1 : -1;
}
function deriveAnimationIndexFromNewNextStepNavState(
  nextNavState: NavigationState
): number {
  const panelContent = getPanelContent(nextNavState);
  if (nextNavState.bigContentModal) {
    return panelContent.animations.length - 1;
  }

  return -1;
}
