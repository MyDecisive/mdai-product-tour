import { useEffect, useMemo, useRef } from "react";
import type { EngineLogsTarget } from "../utils/engineTypesScratch";
import type { LogRecord } from "../utils/types";

export function useGetLogsSimulatorContent({
  activeContext,
  allContexts,
  playing,
}: EngineLogsTarget & { playing: boolean }) {
  const logContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setState((prev) => {
      return {
        ...prev,
        currentIndex: 0,
        cycleCount: prev.cycleCount + 1,
      };
    });
  }, [logRecords]);

  const records = useMemo(() => {
    if (!activeContext || !allContexts[activeContext]) {
      return [] as LogRecord[];
    }

    return allContexts[activeContext].records;
  }, [activeContext, allContexts]);

  useEffect(() => {
    if (logContainerRef.current && records.length && playing) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [records, playing]);

  return {
    records,
    logContainerRef,
  };
}
