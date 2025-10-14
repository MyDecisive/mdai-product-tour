import type { CSSObject } from "@emotion/react";
import { alpha } from "@mui/material";
import { blue, green, grey, orange, red, yellow } from "@mui/material/colors";
import { useEffect, useRef } from "react";
import { STATUS } from "../../../utils/constants";
import type { ActivePod, PodId } from "../../../utils/engineTypesScratch";
import type { PodStatusType } from "../../../utils/types";
import { StyledRow } from "./StyledRow";

const POD_ERROR_RATE = 0.15;

function getNextStatus(currentStatus: PodStatusType): PodStatusType | null {
  switch (currentStatus) {
    case STATUS.pending:
      return STATUS.containerCreating;
    case STATUS.containerCreating:
      return Math.random() < POD_ERROR_RATE ? STATUS.error : STATUS.running;
    case STATUS.error:
      return STATUS.crashLoopBackoff;
    case STATUS.crashLoopBackoff:
      return STATUS.pending;
    case STATUS.terminating:
      return STATUS.shutdown;
    case STATUS.running:
    case STATUS.shutdown:
    default:
      return null;
  }
}

const STATUS_STYLE_MAP: Record<PodStatusType, CSSObject> = {
  [STATUS.pending]: {
    color: yellow[400],
    backgroundColor: alpha(yellow["900"], 0.2),
  },
  [STATUS.containerCreating]: {
    color: blue[400],
    backgroundColor: alpha(blue["900"], 0.2),
  },
  [STATUS.running]: {
    color: green[400],
    backgroundColor: alpha(green["900"], 0.2),
  },
  [STATUS.error]: {
    color: red[400],
    backgroundColor: alpha(red["900"], 0.2),
  },
  [STATUS.crashLoopBackoff]: {
    color: red[400],
    backgroundColor: alpha(red["900"], 0.2),
  },
  [STATUS.terminating]: {
    color: orange[400],
    backgroundColor: alpha(orange["900"], 0.2),
  },
  [STATUS.shutdown]: {
    color: grey[400],
    backgroundColor: alpha(grey["900"], 0.2),
  },
};

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
