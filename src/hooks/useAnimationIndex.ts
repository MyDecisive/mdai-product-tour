import { useContext } from "react";
import { AnimationContext } from "../contexts/animation";

export function useAnimationIndex() {
  const context = useContext(AnimationContext);

  if (context === undefined) {
    throw new Error("useAnimationIndex must be used with a AnimationProvider");
  }

  return context;
}
