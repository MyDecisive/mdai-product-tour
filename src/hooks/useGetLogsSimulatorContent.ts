import { useEffect, useMemo, useRef } from "react";
import type { LogRecord, Player } from "../types/player";

export function useGetLogsSimulatorContent({
  activeContext,
  allContexts,
  playing,
}: NonNullable<Player["logs"]> & { playing: boolean }) {
  const logContainerRef = useRef<HTMLDivElement | null>(null);

  const records = useMemo(() => {
    if (!activeContext || !allContexts[activeContext]) {
      return [] as LogRecord[];
    }

    return allContexts[activeContext].records;
  }, [activeContext, allContexts]);

  useEffect(() => {
    if (logContainerRef.current && records.length) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [records, playing]);

  return {
    records,
    logContainerRef,
  };
}
