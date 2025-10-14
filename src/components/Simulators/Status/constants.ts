import type { CSSObject } from "@emotion/react";
import { alpha } from "@mui/material";

import { blue, green, grey, orange, red, yellow } from "@mui/material/colors";

import type { PodStatusType } from "../../../utils/types";

export const STATUS = {
  pending: "Pending",
  containerCreating: "ContainerCreating",
  running: "Running",
  error: "Error",
  crashLoopBackoff: "CashLoopBackoff",
  terminating: "Terminating",
  shutdown: "Shutdown",
} as const;

const POD_ERROR_RATE = 0.15;

export function getNextStatus(
  currentStatus: PodStatusType
): PodStatusType | null {
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

export const STATUS_STYLE_MAP: Record<PodStatusType, CSSObject> = {
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
