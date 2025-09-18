import { useEffect, useRef, useState } from "react";
import { selectAnimationIndex, selectPanelState } from "../contexts/selectors";
import type { LogRecord, LogSimulatorProps } from "../utils/types";
import { useSelector } from "./useSelector";

function shouldInjectError(hasErrorLogs: boolean, errorFrequency: number) {
  return hasErrorLogs && Math.random() < errorFrequency;
}

function selectErrorPropLog(errorLogs: LogRecord[]) {
  const randomErrorLogIdx = Math.floor(Math.random() * errorLogs.length);
  return errorLogs[randomErrorLogIdx];
}

function selectPropLog(logs: LogRecord[], logIndex: number) {
  return logs[logIndex];
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

function createNextLog(
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
  const animationIndex = useSelector(selectAnimationIndex);
  const { logs = {} } = useSelector(selectPanelState);
  const {
    logRecords = [],
    speed = 1000,
    errorLogs = [],
    errorFrequency = 0.1,
    isPaused = false,
    contextLabel = "",
  } = logs as LogSimulatorProps;

  const [displayedLogs, setDisplayedLogs] = useState<LogRecord[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [cycleCount, setCycleCount] = useState<number>(0);
  const [workingContext, setWorkingContext] = useState<string>(contextLabel);
  const [workDone, setWorkDone] = useState<boolean>(false);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const logContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isPaused) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    if (logRecords.length === 0) return;

    intervalRef.current = setInterval(() => {
      setDisplayedLogs((prev) => {
        let nextLog: LogRecord;
        if (shouldInjectError(!!errorLogs.length, errorFrequency)) {
          const propLog = selectErrorPropLog(errorLogs);
          nextLog = createNextLog(propLog, null, null);
        } else {
          const logIndex = currentIndex % logRecords.length;
          const propLog = selectPropLog(logRecords, logIndex);
          nextLog = createNextLog(propLog, cycleCount, logIndex);

          setCurrentIndex((prevIndex) => {
            const newIndex = prevIndex + 1;
            if (newIndex >= logRecords.length) {
              setCycleCount((prev) => prev + 1);
              return 0;
            }
            return newIndex;
          });
        }

        return [...prev, nextLog];
      });
    }, speed);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [
    logRecords,
    speed,
    errorLogs,
    errorFrequency,
    isPaused,
    currentIndex,
    cycleCount,
  ]);

  useEffect(() => {
    if (!workDone && logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [displayedLogs, workDone]);

  useEffect(() => {
    if (animationIndex === -1 || contextLabel !== workingContext) {
      setDisplayedLogs([]);
      setCurrentIndex(0);
      setCycleCount(0);

      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setWorkingContext(contextLabel);
      setWorkDone(false);
    }
  }, [animationIndex, contextLabel, workingContext]);

  return {
    logContainerRef,
    contextLabel,
    displayedLogs,
  };
}
