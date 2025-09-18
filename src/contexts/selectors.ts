import { createSelector } from "reselect";
import { Home } from "../utils/constants";
import { getViewTitle } from "../utils/strings";
import type { TourState } from "../utils/types";
import { getViewDrawerItems } from "../views/allViewsDrawerContent";
import { getPanelContent } from "../views/allViewsPanelContent";
import { mergeAnimationState } from "../views/common";

export const selectNavigation = (state: TourState) => state.navigation;
export const selectAnimationIndex = (state: TourState) => state.animationIndex;

export const selectInTour = createSelector(
  [selectNavigation],
  (navigation) => navigation.view !== Home
);

export const selectDrawerItems = createSelector(
  [selectNavigation],
  (navigation) => getViewDrawerItems(navigation.view)
);

export const selectDrawerHeaderText = createSelector(
  [selectNavigation],
  (navigation) => getViewTitle(navigation.view)
);

export const selectExpandedDrawerItems = createSelector(
  [selectNavigation],
  (navigation) => {
    const items = [];
    if (navigation.step) {
      items.push(navigation.step);
      if (navigation.subStep) items.push(navigation.subStep);
    }
    return items;
  }
);

export const selectPanelState = createSelector(
  [selectNavigation, selectAnimationIndex],
  (navigation, animationIndex) => {
    const panelContent = getPanelContent(navigation);
    const { initialState, animations, isShowingPreviousContent } = panelContent;
    let state = initialState;

    const effectiveAnimationIndex = isShowingPreviousContent
      ? animations.length - 1
      : animationIndex;

    for (
      let i = 0;
      i <= effectiveAnimationIndex && i < animations.length;
      i++
    ) {
      if (animations[i].stateChanges) {
        state = mergeAnimationState(state, animations[i].stateChanges!);
      }
    }

    return {
      ...state,
      isShowingPreviousContent,
      animations,
    };
  }
);
