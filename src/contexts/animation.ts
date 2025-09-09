import { createContext } from "react";
import type { AnimationState } from "../utils/types";

export interface AnimationContextValue {
  animationIndex: AnimationState;
  setAnimationIndex: React.Dispatch<React.SetStateAction<AnimationState>>;
  beginAnimations: () => void;
  resetAnimations: () => void;
  incrementAnimation: () => void;
}

export const AnimationContext = createContext<
  AnimationContextValue | undefined
>(undefined);
