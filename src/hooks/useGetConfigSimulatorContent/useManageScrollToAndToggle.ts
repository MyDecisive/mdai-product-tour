import { useEffect, useRef } from "react";
import type { SimulatorType } from "../../utils/types";
import { useScrollAnimation } from "./useScrollAnimation";

function getNewlyToggledGroups<T>(current: Set<T>, previous: Set<T>): Set<T> {
  const difference = new Set<T>();

  for (const item of current) {
    if (!previous.has(item)) {
      difference.add(item);
    }
  }

  for (const item of previous) {
    if (!current.has(item)) {
      difference.add(item);
    }
  }

  return difference;
}

export function useManageScrollToAndToggle({
  activeTab,
  showingChange,
  onAnimationComplete,
  addPulsedGroup,
}: {
  activeTab?: string;
  showingChange: Set<string>;
  onAnimationComplete: (sim?: SimulatorType) => void;
  addPulsedGroup: (groupId: string) => void;
}) {
  const { containerRefs, scrollToAndToggle, setContainerRef } =
    useScrollAnimation(addPulsedGroup, onAnimationComplete);

  const prevTogglesRef = useRef<Set<string>>(showingChange);

  useEffect(() => {
    let scrollPromise: (Promise<void> & { cancel?: () => void }) | undefined;

    if (!activeTab) return;

    const prev = prevTogglesRef.current || new Set();
    const current = showingChange;

    const newlyToggledGroups = getNewlyToggledGroups<string>(current, prev);
    console.log({ prev, current, newlyToggledGroups });

    if (newlyToggledGroups.size === 0) {
      prevTogglesRef.current = current;
      return;
    }

    const timeout = setTimeout(() => {
      scrollPromise = scrollToAndToggle([...newlyToggledGroups]);
    }, 0);

    prevTogglesRef.current = current;

    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
      if (scrollPromise?.cancel) {
        scrollPromise.cancel();
      }
    };
  }, [activeTab, showingChange, scrollToAndToggle]);

  return {
    setContainerRef,
    containerRefs,
    groupsShowingChange: prevTogglesRef.current,
  };
}
