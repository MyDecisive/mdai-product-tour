import { useState, useRef, useEffect, useCallback } from "react";

export const usePulsedLines = (fileNames: string[]) => {
  const [pulsedLines, setPulsedLines] = useState<Record<string, Set<number>>>(
    fileNames.reduce((accum, name) => {
      accum[name] = new Set();

      return accum;
    }, {} as Record<string, Set<number>>)
  );

  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);

  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach(clearTimeout);
      timeoutsRef.current = [];
    };
  }, []);

  useEffect(() => {
    setPulsedLines((old) => {
      const newState = fileNames.reduce((accum, name) => {
        accum[name] = old[name] || new Set();
        return accum;
      }, {} as Record<string, Set<number>>);
      return newState;
    });
  }, [fileNames]);

  const addPulsedLines = useCallback((fileName: string, lineNos: number[]) => {
    if (!lineNos.length) {
      return;
    }
    setPulsedLines((prev) => {
      const newState = { ...prev };

      if (!newState[fileName]) {
        newState[fileName] = new Set<number>();
      }

      lineNos.forEach((lineNo) => newState[fileName].add(lineNo));
      return newState;
    });

    const timeoutId = setTimeout(() => {
      setPulsedLines((prev) => {
        const newState = { ...prev };
        lineNos.forEach((lineNo) => newState[fileName].delete(lineNo));
        return newState;
      });
    }, 1500);
    timeoutsRef.current.push(timeoutId);
  }, []);

  return { pulsedLines, addPulsedLines };
};
