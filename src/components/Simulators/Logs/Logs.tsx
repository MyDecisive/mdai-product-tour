import { Box } from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import { useGetLogsSimulatorContent } from "../../../hooks/useGetLogsSimulatorContent";
import type { LogRecord } from "../../../utils/types";
import { SimulatorContextLabel } from "../SimContextLabel";
import { LogRow } from "./LogRow";

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

export const LogsSimulator: React.FC = () => {
  const logs = useGetLogsSimulatorContent();
  const {
    logRecords = [],
    speed = 1000,
    errorLogs = [],
    errorFrequency = 0.1,
    isPaused = false,
    contextLabel,
  } = logs || {};

  const [displayedLogs, setDisplayedLogs] = useState<LogRecord[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [cycleCount, setCycleCount] = useState<number>(0);
  const [lastKnownLogsLength, setLastKnownLogsLength] = useState<number>(0);

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
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [displayedLogs]);

  useEffect(() => {
    const currentLogsLength = logRecords?.length || 0;

    if (
      currentLogsLength < lastKnownLogsLength ||
      (currentLogsLength > 0 && displayedLogs.length === 0)
    ) {
      setDisplayedLogs([]);
      setCurrentIndex(0);
      setCycleCount(0);

      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    setLastKnownLogsLength(currentLogsLength);
  }, [logRecords?.length, lastKnownLogsLength, displayedLogs.length]);

  return (
    <>
      <SimulatorContextLabel>{contextLabel}</SimulatorContextLabel>
      <Box
        ref={logContainerRef}
        sx={{
          scrollBehavior: "smooth",
          overflowY: "auto",
          maxHeight: "350px",
        }}
      >
        {displayedLogs.map((log) => (
          <LogRow key={log.id} {...log} />
        ))}
      </Box>
    </>
  );
};
