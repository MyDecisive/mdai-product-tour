import { useCallback, useEffect, useRef } from "react";
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
  onToggleShowingChange,
}: {
  activeTab?: string;
  showingChange: Set<string>;
  onAnimationComplete: (sim?: SimulatorType) => void;
  addPulsedGroup: (groupId: string) => void;
  onToggleShowingChange: (groupId: string) => void;
}) {
  const { scrollToAndToggle, makeSetContainerRef } = useScrollAnimation(
    addPulsedGroup,
    onAnimationComplete
  );

  const prevTogglesRef = useRef<Set<string>>(showingChange);

  const handleToggleShowingChange = useCallback(
    (groupId: string) => {
      const newTogglesRef = new Set(prevTogglesRef.current);
      if (newTogglesRef.has(groupId)) {
        newTogglesRef.delete(groupId);

        prevTogglesRef.current = newTogglesRef;
      } else {
        newTogglesRef.add(groupId);

        prevTogglesRef.current = newTogglesRef;
      }

      onToggleShowingChange(groupId);
    },
    [onToggleShowingChange]
  );

  useEffect(() => {
    let scrollPromise: (Promise<void> & { cancel?: () => void }) | undefined;

    if (!activeTab) return;

    const prev = prevTogglesRef.current || new Set();
    const current = showingChange;

    const newlyToggledGroups = getNewlyToggledGroups<string>(current, prev);

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
    makeSetContainerRef,
    handleToggleShowingChange,
    groupsShowingChange: prevTogglesRef.current,
  };
}
