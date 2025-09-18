import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { selectPanelState } from "../contexts/selectors";
import type { ConfigTextProps, HighlightBounds } from "../utils/types";
import { useHighlander } from "./useHighlander";
import { useSelector } from "./useSelector";

function fillHighlightRanges(highlights: HighlightBounds[]): Set<number> {
  const highlightSet = new Set<number>();

  highlights?.forEach(([start, end]) => {
    for (let i = start; i <= end; i++) {
      highlightSet.add(i);
    }
  });

  return highlightSet;
}

function smoothScrollTo(
  element: HTMLElement,
  targetTop: number,
  duration: number = 1000
): Promise<void> {
  return new Promise((resolve) => {
    const startTop = element.scrollTop;
    const distance = targetTop - startTop;
    const startTime = performance.now();

    function animate(currentTime: number) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function (ease-in-out)
      const easeInOut =
        progress < 0.5
          ? 2 * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;

      element.scrollTop = startTop + distance * easeInOut;

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        resolve();
      }
    }

    requestAnimationFrame(animate);
  });
}

export function useGetConfigSimulatorContent() {
  const { config = {} } = useSelector(selectPanelState);
  const { actions } = useHighlander();
  const [workDone, setWorkDone] = useState<boolean>(false);

  const { text, activeRange, title, highlights } = config as ConfigTextProps;

  const containerRef = useRef<HTMLDivElement>(null);

  const onScrollEnd = useCallback(() => {
    actions.INCREMENT_ANIMATION();
    setWorkDone(true);
  }, [actions, setWorkDone]);

  const processedLines = useMemo(() => {
    const rawLines = (text ?? "").split("\n");
    const highlightSet = fillHighlightRanges(highlights || []);

    return rawLines.map((line, i) => {
      const lineNo = i + 1;
      return {
        lineNo,
        content: line,
        isHighlighted: highlightSet.has(lineNo),
      };
    });
  }, [text, activeRange, highlights]);

  useEffect(() => {
    if (!workDone) {
      if (!activeRange) {
        smoothScrollTo(containerRef.current!, 0, 800);
        return;
      }

      const el = containerRef.current?.querySelector<HTMLDivElement>(
        `[data-line="${activeRange.start - 1}"]`
      );

      if (el && containerRef.current) {
        const targetTop = el.offsetTop;
        smoothScrollTo(containerRef.current, targetTop, 1200).then(() => {
          onScrollEnd();
        });
      }
    }
  }, [activeRange, workDone, onScrollEnd]);

  useEffect(() => {
    setWorkDone(false);
  }, [activeRange?.start, activeRange?.end, text, title]);

  return {
    title,
    processedLines,
    containerRef,
    activeRange,
  };
}
