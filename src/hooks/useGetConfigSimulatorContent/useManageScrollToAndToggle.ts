import { useEffect, useRef } from "react";
import type { FileConfig, LineToggles } from "../../utils/types";
import { initialTogglesForAllFiles } from "./useLineToggles";
import { useScrollAnimation } from "./useScrollAnimation";

const getNewlyToggledLines = (current: LineToggles, prev: LineToggles) => {
  return Object.keys(current)
    .map(Number)
    .filter((lineNo) => current[lineNo] && !prev[lineNo]);
};

export function useManageScrollToAndToggle({
  activeTab,
  files,
  fileNames,
  stableInitialToggles,
  toggleLineValue,
}: {
  stableInitialToggles: string;
  activeTab?: string;
  files: Record<string, FileConfig>;
  fileNames: string[];
  toggleLineValue: (fileName: string, lineNos: number[]) => void;
}) {
  const { containerRefs, scrollToAndToggle } = useScrollAnimation(
    fileNames,
    toggleLineValue
  );

  const prevInitialLineTogglesRef = useRef<Record<string, LineToggles>>(
    initialTogglesForAllFiles(files)
  );

  useEffect(() => {
    let scrollPromise: (Promise<void> & { cancel?: () => void }) | undefined;

    if (!activeTab) return;

    const prev = prevInitialLineTogglesRef.current[activeTab] || {};
    const current = files[activeTab]?.initialLineToggles || {};

    const newlyToggledLines = getNewlyToggledLines(current, prev);

    if (newlyToggledLines.length === 0) {
      prevInitialLineTogglesRef.current[activeTab] = current;
      return;
    }

    const timeout = setTimeout(() => {
      scrollPromise = scrollToAndToggle(activeTab, newlyToggledLines);
    }, 0);

    prevInitialLineTogglesRef.current[activeTab] = current;

    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
      if (scrollPromise?.cancel) {
        scrollPromise.cancel();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, stableInitialToggles, scrollToAndToggle]);

  return { containerRefs };
}
