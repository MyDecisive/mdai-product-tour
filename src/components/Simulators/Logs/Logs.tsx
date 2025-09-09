import { Box } from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import type { LogRecord, LogSimulatorProps } from "../../../utils/types";
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

export const LogsSimulator: React.FC<LogSimulatorProps> = ({
  logs = [],
  speed = 1000,
  errorLogs = [],
  errorFrequency = 0.1,
  isPaused = false,
  contextLabel,
}) => {
  const [displayedLogs, setDisplayedLogs] = useState<LogRecord[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [cycleCount, setCycleCount] = useState<number>(0);
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

    if (logs.length === 0) return;

    intervalRef.current = setInterval(() => {
      setDisplayedLogs((prev) => {
        let nextLog: LogRecord;
        if (shouldInjectError(!!errorLogs.length, errorFrequency)) {
          const propLog = selectErrorPropLog(errorLogs);
          nextLog = createNextLog(propLog, null, null);
        } else {
          const logIndex = currentIndex % logs.length;
          const propLog = selectPropLog(logs, logIndex);
          nextLog = createNextLog(propLog, cycleCount, logIndex);

          setCurrentIndex((prevIndex) => {
            const newIndex = prevIndex + 1;
            if (newIndex >= logs.length) {
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
    logs,
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

// const sampleLogs: LogRecord[] = [
//   { message: "Application started successfully" },
//   { message: "Database connection established" },
//   { message: "Loading configuration from /etc/app/config.yaml" },
//   { message: "Starting HTTP server on port 8080" },
//   { message: "Processing incoming request GET /api/users" },
//   { message: "Query executed in 23ms" },
//   { message: "Response sent with status 200" },
//   { message: "Cache hit for key: user_123" },
//   { message: "Background job scheduled: data-cleanup" },
//   { message: "Memory usage: 245MB / 512MB" },
//   { message: "Processing batch job with 150 items" },
//   { message: "Health check passed" },
// ];

// const errorLogs: LogRecord[] = [
//   { message: "Failed to connect to external API", level: "error" },
//   { message: "Database query timeout after 30s", level: "error" },
//   { message: "Invalid JSON in request body", level: "error" },
//   { message: "Rate limit exceeded for client 192.168.1.100", level: "warn" },
// ];
