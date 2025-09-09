import {
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  AnimationContext,
  type AnimationContextValue,
} from "../contexts/animation";
import { useNavigation } from "../hooks/useNavigation";
import { DEFAULT_ANIMATION_STEP_DURATION } from "../utils/constants";
import type { AnimationState } from "../utils/types";
import { getPanelContent } from "../views/allViewsPanelContent";

interface AnimationProviderProps {
  children: ReactNode;
  initialState?: AnimationState;
}

export function AnimationProvider({
  children,
  initialState = -1,
}: AnimationProviderProps) {
  const { view, step, subStep } = useNavigation();

  const [animationIndex, setAnimationIndex] =
    useState<AnimationState>(initialState);

  const beginAnimations = useCallback(() => setAnimationIndex(0), []);
  const resetAnimations = useCallback(() => setAnimationIndex(-1), []);
  const incrementAnimation = useCallback(
    () => setAnimationIndex((prev) => prev + 1),
    []
  );

  useEffect(() => {
    resetAnimations();
  }, [view, step, subStep, resetAnimations]);

  const { animations } = useMemo(() => {
    return getPanelContent(view, step, subStep);
  }, [view, step, subStep]);

  useEffect(() => {
    if (animations.length === 0 || animationIndex >= animations.length - 1)
      return;

    let timeout: NodeJS.Timeout;

    if (animationIndex === -1) {
      timeout = setTimeout(() => {
        beginAnimations();
      }, DEFAULT_ANIMATION_STEP_DURATION);
    } else {
      const currentAnimation = animations[animationIndex];

      if (currentAnimation.type === "delay") {
        timeout = setTimeout(() => {
          incrementAnimation();
        }, currentAnimation.delay);
      }
    }

    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [animationIndex, animations, incrementAnimation, beginAnimations]);

  const value: AnimationContextValue = {
    animationIndex,
    setAnimationIndex,
    beginAnimations,
    resetAnimations,
    incrementAnimation,
  };

  return (
    <AnimationContext.Provider value={value}>
      {children}
    </AnimationContext.Provider>
  );
}
