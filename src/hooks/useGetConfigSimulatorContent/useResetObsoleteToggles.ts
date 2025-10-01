import { useEffect } from "react";
import type { FileConfig, LineToggles } from "../../utils/types";

export function useResetObsoleteToggles({
  activeFileTitle,
  files,
  lineToggles,
  stableInitialToggles,
  resetToggles,
  stableToggles,
}: {
  stableToggles: string;
  stableInitialToggles: string;
  activeFileTitle?: string;
  files: Record<string, FileConfig>;
  lineToggles: Record<string, LineToggles>;
  resetToggles: () => void;
}) {
  useEffect(() => {
    if (!activeFileTitle) return;

    const currentToggles = lineToggles[activeFileTitle] || {};
    const initialToggles = files[activeFileTitle]?.initialLineToggles || {};

    const hasNoInitialToggles = Object.keys(initialToggles).length === 0;
    const hasCurrentToggles = Object.keys(currentToggles).length > 0;

    if (hasNoInitialToggles && hasCurrentToggles) {
      resetToggles();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFileTitle, stableInitialToggles, stableToggles, resetToggles]);
}
