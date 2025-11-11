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
type CurrentLogsSimulatorState = {
  displayedLogs: LogRecord[];
  cycleCount: number;
  currentIndex: number;
};

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

  const [state, setState] = useState<CurrentLogsSimulatorState>({
    displayedLogs: [],
    cycleCount: 0,
    currentIndex: 0,
  });
  const [workingContext, setWorkingContext] = useState<string>(contextLabel);
  const [workDone, setWorkDone] = useState<boolean>(false);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
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

  useEffect(() => {
    if (isPaused) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    if (logRecords.length === 0) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    intervalRef.current = setInterval(() => {
      setState((prev) => {
        let nextLog: LogRecord;
        let newIndex = prev.currentIndex;
        let newCycleCount = prev.cycleCount;

        if (shouldInjectError(!!errorLogs.length, errorFrequency)) {
          const propLog = selectErrorPropLog(errorLogs);
          nextLog = createNextLog(propLog, null, null);
        } else {
          const logIndex = prev.currentIndex % logRecords.length;
          const propLog = selectPropLog(logRecords, logIndex);
          nextLog = createNextLog(propLog, prev.cycleCount, logIndex);

          newIndex = prev.currentIndex + 1;
          if (newIndex >= logRecords.length) {
            newCycleCount = prev.cycleCount + 1;
            newIndex = 0;
          }
        }

        const returnVal = {
          displayedLogs: [...prev.displayedLogs, nextLog],
          currentIndex: newIndex,
          cycleCount: newCycleCount,
        };

        return returnVal;
      });
    }, speed);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [logRecords, speed, errorLogs, errorFrequency, isPaused]);

  useEffect(() => {
    if (!workDone && logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [state.displayedLogs, workDone]);

  useEffect(() => {
    if (animationIndex === -1 || contextLabel !== workingContext) {
      setState({
        displayedLogs: [],
        cycleCount: 0,
        currentIndex: 0,
      });

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
    displayedLogs: state.displayedLogs,
  };
}
