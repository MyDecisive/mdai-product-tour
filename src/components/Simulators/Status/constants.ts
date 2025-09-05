import type { CSSObject } from "@emotion/react";
import { alpha } from "@mui/material";

import { blue, green, grey, orange, red, yellow } from "@mui/material/colors";

import type { StatusString } from "./types";

const pending: StatusString = "Pending";
const containerCreating: StatusString = "ContainerCreating";
const running: StatusString = "Running";
const error: StatusString = "Error";
const crashLoopBackoff: StatusString = "CashLoopBackoff";
const terminating: StatusString = "Terminating";
const shutdown: StatusString = "Shutdown";

export const STATUS = {
  pending,
  containerCreating,
  running,
  error,
  crashLoopBackoff,
  terminating,
  shutdown,
} as const;

const POD_ERROR_RATE = 0.15;

export function getNextStatus(currentStatus: StatusString) {
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

export const STATUS_STYLE_MAP: Record<StatusString, CSSObject> = {
  [pending]: {
    color: yellow[400],
    backgroundColor: alpha(yellow["900"], 0.2),
  },
  [containerCreating]: {
    color: blue[400],
    backgroundColor: alpha(blue["900"], 0.2),
  },
  [running]: {
    color: green[400],
    backgroundColor: alpha(green["900"], 0.2),
  },
  [error]: {
    color: red[400],
    backgroundColor: alpha(red["900"], 0.2),
  },
  [crashLoopBackoff]: {
    color: red[400],
    backgroundColor: alpha(red["900"], 0.2),
  },
  [terminating]: {
    color: orange[400],
    backgroundColor: alpha(orange["900"], 0.2),
  },
  [shutdown]: {
    color: grey[400],
    backgroundColor: alpha(grey["900"], 0.2),
  },
};
