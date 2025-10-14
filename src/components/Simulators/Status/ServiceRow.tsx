import { useEffect, useRef } from "react";
import type { ActivePod } from "../../../utils/engineTypesScratch";
import type { PodStatusType } from "../../../utils/types";
import { getNextStatus, STATUS, STATUS_STYLE_MAP } from "./constants";
import { StyledRow } from "./StyledRow";
import type { PodId } from "./types";

type ServiceRowProps = Omit<ActivePod, "replicaNo" | "parentServiceKey"> & {
  onStatusChange: (podId: PodId, newStatus: PodStatusType) => void;
};

function createStatusChangeDelay() {
  return Math.random() * 2000 + 1000; // 1-3 seconds
}

export const ServiceRow: React.FC<ServiceRowProps> = ({
  name,
  namespace,
  id,
  status,
  restartCount,
  onStatusChange,
}) => {
  const timeoutRef = useRef<NodeJS.Timeout>(null);

  useEffect(() => {
    const scheduleNextTransition = () => {
      const nextStatus = getNextStatus(status);

      if (nextStatus !== null) {
        const delay = createStatusChangeDelay();

        timeoutRef.current = setTimeout(() => {
          onStatusChange(id, nextStatus);

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
  }, [status, id, onStatusChange]);

  const rowColor = STATUS_STYLE_MAP[status]?.color;
  const rowBackgroundColor = STATUS_STYLE_MAP[status]?.backgroundColor;

  return (
    <StyledRow
      name={name}
      namespace={namespace}
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
