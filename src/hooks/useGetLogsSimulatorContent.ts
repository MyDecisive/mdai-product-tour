import { useEffect, useRef } from "react";

export function useGetLogsSimulatorContent() {
  const logContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, []);

  return {
    logContainerRef,
  };
}
