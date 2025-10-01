import { useCallback, useEffect, useState } from "react";
import type { FileConfig, LineToggles } from "../../utils/types";

export function initialTogglesForAllFiles(files: Record<string, FileConfig>) {
  return Object.entries(files).reduce((accum, [key, file]) => {
    accum[key] = file.initialLineToggles || {};
    return accum;
  }, {} as Record<string, LineToggles>);
}

export const useLineToggles = (files: Record<string, FileConfig>) => {
  const [lineToggles, setLineToggles] = useState<Record<string, LineToggles>>(
    () => {
      return initialTogglesForAllFiles(files);
    }
  );

  useEffect(() => {
    setLineToggles(initialTogglesForAllFiles(files));
  }, [files]);

  const toggleLines = useCallback((fileName: string, lineNos: number[]) => {
    setLineToggles((prev) => ({
      ...prev,
      [fileName]: {
        ...prev[fileName],
        ...lineNos.reduce((toggles, num) => {
          toggles[num] = !prev[fileName]?.[num];
          return toggles;
        }, {} as LineToggles),
      },
    }));
  }, []);

  const resetToggles = useCallback(() => {
    setLineToggles(initialTogglesForAllFiles(files));
  }, [files]);

  return { lineToggles, toggleLines, resetToggles };
};
