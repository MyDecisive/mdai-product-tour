import { useEffect, useRef } from "react";
import type { EngineLogsTarget } from "../utils/engineTypesScratch";

export function useGetLogsSimulatorContent({
  records,
  playing,
}: Pick<EngineLogsTarget, "records"> & { playing: boolean }) {
  const logContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (logContainerRef.current && records.length && playing) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [records, playing]);

  return {
    logContainerRef,
  };
}
