import { useEffect, useRef } from "react";
import type { LogRecord } from "../utils/types";

export function shouldInjectError(
  hasErrorLogs: boolean,
  errorFrequency: number
) {
  return hasErrorLogs && Math.random() < errorFrequency;
}

export function selectErrorPropLog(errorLogs: LogRecord[]) {
  const randomErrorLogIdx = Math.floor(Math.random() * errorLogs.length);
  return errorLogs[randomErrorLogIdx];
}

function numIsNull(arg: number | null) {
  return arg == null;
}

function createNextLogId(cycleCount: number | null, logIndex: number | null) {
  if (numIsNull(cycleCount) && numIsNull(logIndex)) {
    return `error-${Date.now()}-${Math.random()}`;
  }
  return `log-${cycleCount}-${logIndex}`;
}

export function createNextLog(
  propLog: LogRecord,
  cycleCount: number | null,
  logIndex: number | null
) {
  return {
    ...propLog,
    timestamp: new Date().toISOString(),
    id: createNextLogId(cycleCount, logIndex),
  };
}

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
