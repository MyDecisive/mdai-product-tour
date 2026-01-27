import { useCallback, useEffect, useRef } from "react";
import type { ActiveScrollTarget } from "../../types/player";
import { GROUP_ID_DELIM } from "../../utils/constants";
import { delay } from "../../utils/delay";
import { calculateScrollTarget, smoothScrollTo } from "./scrollHelpers";

export function useManageScrollTo({
  onConfigScrollComplete,
  activeScrollTarget,
}: {
  activeScrollTarget: ActiveScrollTarget | undefined;
  onConfigScrollComplete: (scrollId: string) => void;
}) {
  const containerRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const makeSetContainerRef = useCallback((fileName: string) => {
    return (element: HTMLDivElement | null) => {
      containerRefs.current[fileName] = element;
    };
  }, []);

  const scrollTo = useCallback(
    async (scrollTarget: ActiveScrollTarget) => {
      const [fileName, groupLineRange] =
        scrollTarget.groupId.split(GROUP_ID_DELIM);
      const [startLineNo] = groupLineRange.split("-"); // This is kind of cheating, but the groupId structure is consistent.

      const lowestLine = parseInt(startLineNo);

      const ref = containerRefs.current[fileName];
      const targetTop = calculateScrollTarget(ref, lowestLine);

      if (targetTop !== null && ref) {
        await smoothScrollTo(ref, targetTop, 800);

        await delay(750);
        onConfigScrollComplete(scrollTarget.id);
      }
    },
    [containerRefs, onConfigScrollComplete],
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
