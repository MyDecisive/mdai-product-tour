import { useCallback, useEffect, useRef } from "react";
import type { EngineConfigSimScrollTarget } from "../../utils/engineTypesScratch";
import { delay } from "../../utils/delay";
import { calculateScrollTarget, smoothScrollTo } from "./scrollHelpers";

export function useManageScrollTo({
  onConfigScrollComplete,
  activeScrollTarget,
}: {
  activeScrollTarget: EngineConfigSimScrollTarget | undefined;
  onConfigScrollComplete: (scrollId: string) => void;
}) {
  const containerRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const makeSetContainerRef = useCallback((fileName: string) => {
    return (element: HTMLDivElement | null) => {
      containerRefs.current[fileName] = element;
    };
  }, []);

  const scrollTo = useCallback(
    async (scrollTarget: EngineConfigSimScrollTarget) => {
      const [fileName, lineNoStr] = scrollTarget.groupId.split("-"); // This is kind of cheating, but the groupId structure is consistent.

      const lowestLine = parseInt(lineNoStr);

      const ref = containerRefs.current[fileName];
      const targetTop = calculateScrollTarget(ref, lowestLine);

      if (targetTop !== null && ref) {
        await smoothScrollTo(ref, targetTop, 800);

        await delay(750);
        onConfigScrollComplete(scrollTarget.id);
      }
    },
    [containerRefs, onConfigScrollComplete]
  );

  useEffect(() => {
    if (!activeScrollTarget) return;

    async function executeScroll() {
      await scrollTo(activeScrollTarget!);
    }

    void executeScroll();
  }, [scrollTo, activeScrollTarget]);

  return {
    makeSetContainerRef,
  };
}
