import { useEffect, useRef } from "react";
import type { FileConfig, LineToggles } from "../../utils/types";
import { initialTogglesForAllFiles } from "./useLineToggles";
import { useScrollAnimation } from "./useScrollAnimation";

export function useManageInitialLinesUpdates({
  activeTab,
  files,
  fileNames,
  lineToggles,
  stableInitialToggles,
  resetToggles,
  toggleLineValue,
  stableToggles,
}: {
  stableToggles: string;
  stableInitialToggles: string;
  activeTab?: string;
  files: Record<string, FileConfig>;
  fileNames: string[];
  lineToggles: Record<string, LineToggles>;
  resetToggles: () => void;
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
    let timeout: NodeJS.Timeout;
    let scrollPromise: Promise<void> & { cancel?: () => void };
    if (!activeTab) {
      return;
    }
    const prev = prevInitialLineTogglesRef.current[activeTab];
    const toggledLineNos = Object.keys(
      files[activeTab]?.initialLineToggles || {}
    );

    const currentLineTogglesAreObsolete =
      toggledLineNos.length === 0 &&
      lineToggles[activeTab] &&
      Object.keys(lineToggles[activeTab]).length;
    if (currentLineTogglesAreObsolete) {
      resetToggles();
      return;
    }

    const newlyToggledLines = toggledLineNos
      .map(Number)
      .filter(
        (lineNo) =>
          files[activeTab].initialLineToggles![lineNo] && !prev?.[lineNo]
      );

    const mustScrollAndToggle = newlyToggledLines.length > 0;
    if (mustScrollAndToggle) {
      timeout = setTimeout(() => {
        scrollPromise = scrollToAndToggle(activeTab, newlyToggledLines);
      }, 0);
    }

    prevInitialLineTogglesRef.current = {
      ...prevInitialLineTogglesRef.current,
      [activeTab]: files[activeTab]?.initialLineToggles || {},
    };

    return () => {
      clearTimeout(timeout);
      if (
        typeof scrollPromise !== "undefined" &&
        typeof scrollPromise.cancel === "function"
      ) {
        scrollPromise.cancel();
      }
    };
  }, [
    stableInitialToggles,
    stableToggles,
    resetToggles,
    scrollToAndToggle,
    activeTab,
  ]);

  return { containerRefs };
}
