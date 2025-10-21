import { useCallback, useRef } from "react";
import { SIMULATORS } from "../../utils/constants";
import { delay } from "../../utils/delay";
import type { SimulatorType } from "../../utils/types";
import { calculateScrollTarget, smoothScrollTo } from "./scrollHelpers";

export const useScrollAnimation = (
  addPulsedGroup: (groupId: string) => void,
  onAnimationComplete: (sim?: SimulatorType) => void
) => {
  const containerRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const setContainerRef = useCallback((fileName: string) => {
    return (element: HTMLDivElement | null) => {
      containerRefs.current[fileName] = element;
    };
  }, []);

  const scrollToAndToggle = useCallback(
    async (groupIds: string[]) => {
      const [fileName] = groupIds[0].split("-"); // This is kind of cheating, but the groupId structure is consistent.

      const lowestLine = Math.min(
        ...groupIds.map((id) => parseInt(id.split("-")[1]))
      );

      const ref = containerRefs.current[fileName];
      const targetTop = calculateScrollTarget(ref, lowestLine);

      if (targetTop !== null && ref) {
        await smoothScrollTo(ref, targetTop, 800);
        groupIds.forEach(addPulsedGroup);

        await delay(750);
        onAnimationComplete(SIMULATORS.CONFIG);
      }
    },
    [containerRefs, addPulsedGroup, onAnimationComplete]
  );

  return { scrollToAndToggle, containerRefs, setContainerRef };
};
