import { useRef, useEffect, createRef, useCallback } from "react";
import { useHighlander } from "../useHighlander";
import { calculateScrollTarget, smoothScrollTo } from "./scrollHelpers";

export const useScrollAnimation = (
  fileNames: string[],
  toggleLineValue: (fileName: string, lineNos: number[]) => void
) => {
  const { actions } = useHighlander();
  const containerRefs = useRef<
    Record<string, React.RefObject<HTMLDivElement | null>>
  >({});

  useEffect(() => {
    const newRefs: Record<string, React.RefObject<HTMLDivElement | null>> = {};
    fileNames.forEach((name) => {
      // Preserve existing refs or create new ones
      newRefs[name] =
        containerRefs.current[name] || createRef<HTMLDivElement>();
    });
    containerRefs.current = newRefs;
  }, [fileNames]);

  const scrollToAndToggle = useCallback(
    async (fileName: string, lineNos: number[]) => {
      if (lineNos.length === 0) return;

      const lowestLineNo = Math.min(...lineNos);
      const ref = containerRefs.current[fileName].current;
      const targetTop = calculateScrollTarget(ref, lowestLineNo);

      if (targetTop !== null && ref) {
        await smoothScrollTo(ref, targetTop, 800);
        toggleLineValue(fileName, lineNos);
        actions.INCREMENT_ANIMATION();
      }
    },
    [containerRefs, toggleLineValue, actions]
  );

  return { scrollToAndToggle, containerRefs };
};
