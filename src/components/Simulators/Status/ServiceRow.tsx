import { useEffect, useMemo, useRef, useState } from "react";
import { getNextStatus, STATUS, STATUS_STYLE_MAP } from "./constants";
import { StyledRow } from "./StyledRow";
import type { PodId, StatusString } from "./types";

interface ServiceRowProps {
  name: string;
  podId: PodId;
  status: StatusString;
  beingReplaced?: boolean;
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
  podId,
  beingReplaced,
  status,
  onStatusChange,
  onRemove,
}) => {
  const podName = useMemo(() => {
    return `${name}-${createServiceNameSuffix()}`;
  }, [name]);

  const [restartCount, setRestartCount] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout>(null);

  const isShuttingDown = useMemo(() => {
    return beingReplaced && status === STATUS.running;
  }, [beingReplaced, status]);

  useEffect(() => {
    const scheduleNextTransition = () => {
      let nextStatus: StatusString | null;

      if (isShuttingDown && status === STATUS.running) {
        nextStatus = STATUS.terminating;
      } else if (status === STATUS.shutdown) {
        timeoutRef.current = setTimeout(() => onRemove(podId), 1000);
        return;
      } else {
        nextStatus = getNextStatus(status);
      }

      if (nextStatus !== null) {
        const delay = createStatusChangeDelay();

        timeoutRef.current = setTimeout(() => {
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
  }, [isShuttingDown, status, podId, onStatusChange, onRemove]);

  const rowColor = STATUS_STYLE_MAP[status]?.color;
  const rowBackgroundColor = STATUS_STYLE_MAP[status]?.backgroundColor;

  return (
    <StyledRow
      name={podName}
      ready={status === STATUS.running ? "1/1" : "0/1"}
      status={status}
      restarts={restartCount.toString()}
      containerStyles={{
        color: rowColor || "white",
        backgroundColor: rowBackgroundColor || "black",
      }}
    />
  );
};
