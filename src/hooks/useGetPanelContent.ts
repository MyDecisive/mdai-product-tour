import { useMemo } from "react";

import { type SimulatorPanelState } from "../utils/types";
import { mergeAnimationState } from "../views/common";
import { getPanelContent } from "../views/content";
import { useAnimationIndex } from "./useAnimationIndex";
import { useNavigation } from "./useNavigation";

export function useGetPanelContent() {
  const { view, step, subStep } = useNavigation();
  const { animationIndex } = useAnimationIndex();

  const { initialState, animations } = useMemo(() => {
    return getPanelContent(view, step, subStep);
  }, [view, step, subStep]);

  const panelState = useMemo(() => {
    let state = initialState;

    for (let i = 0; i <= animationIndex && i < animations.length; i++) {
      const animation = animations[i];
      if (animation.stateChanges) {
        state = mergeAnimationState(
          state,
          animation.stateChanges
        ) as SimulatorPanelState;
      }
    }

    return state;
  }, [initialState, animations, animationIndex]);

  return panelState;
}
