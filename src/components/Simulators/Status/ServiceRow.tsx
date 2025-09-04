import { useEffect, useMemo, useRef, useState } from "react";
import { getNextStatus, STATUS, STATUS_STYLE_MAP } from "./constants";
import { StyledRow } from "./StyledRow";
import type { PodId, StatusString } from "./types";

interface ServiceRowProps {
  name: string;
  podId: PodId;
  shouldReplace?: string; // ID of pod to replace
  skipStartup?: boolean;
  onStatusChange: (podId: string, status: string) => void;
  onRemove: (podId: string) => void;
}

const SUFFIX_LENGTH = 5;

function createServiceNameSuffix() {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";

  return Array.from(
    { length: SUFFIX_LENGTH },
    () => chars[Math.floor(Math.random() * chars.length)]
  ).join("");
}

function createStatusChangeDelay() {
  return Math.random() * 2000 + 1000; // 1-3 seconds
}

export const ServiceRow: React.FC<ServiceRowProps> = ({
  name,
  skipStartup,
  podId,
  shouldReplace,
  onStatusChange,
  onRemove,
}) => {
  const podName = useMemo(() => {
    return `${name}-${createServiceNameSuffix()}`;
  }, [name]);

  const [podStatus, setPodStatus] = useState<StatusString>(() => {
    if (skipStartup) {
      return STATUS.running;
    }
    return STATUS.pending;
  });

  const [restartCount, setRestartCount] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout>(null);

  const isShuttingDown = useMemo(() => {
    return shouldReplace === podId && podStatus === STATUS.running;
  }, [shouldReplace, podId, podStatus]);

  useEffect(() => {
    if (skipStartup) {
      onStatusChange(podId, podStatus);
      return;
    }

    const scheduleNextTransition = () => {
      let nextStatus: StatusString | null;

      if (isShuttingDown && podStatus === STATUS.running) {
        nextStatus = STATUS.terminating;
      } else if (podStatus === STATUS.shutdown) {
        timeoutRef.current = setTimeout(() => onRemove(podId), 1000);
        return;
      } else {
        nextStatus = getNextStatus(podStatus);
      }

      if (nextStatus !== null) {
        const delay = createStatusChangeDelay();

        timeoutRef.current = setTimeout(() => {
          setPodStatus(nextStatus);
          onStatusChange(podId, nextStatus);

          if (nextStatus === STATUS.crashLoopBackoff) {
            setRestartCount((prev) => prev + 1);
          }

          scheduleNextTransition();
        }, delay);
      }
    };

    scheduleNextTransition();

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [skipStartup, isShuttingDown, podStatus, podId, onStatusChange, onRemove]);

  useEffect(() => {
    onStatusChange(podId, podStatus);
  }, []);

  const rowColor = STATUS_STYLE_MAP[podStatus]?.color;
  const rowBackgroundColor = STATUS_STYLE_MAP[podStatus]?.backgroundColor;

  return (
    <StyledRow
      name={podName}
      ready={podStatus === STATUS.running ? "1/1" : "0/1"}
      status={podStatus}
      restarts={restartCount.toString()}
      containerStyles={{
        color: rowColor || "white",
        backgroundColor: rowBackgroundColor || "black",
      }}
    />
  );
};
