import type {
  FRAME_TYPES,
  LOG_FORMAT,
  LOG_LEVELS,
  SIMULATORS,
  STATUS,
} from "../utils/constants";

export type Simulator = (typeof SIMULATORS)[keyof typeof SIMULATORS];

export type Frame = (typeof FRAME_TYPES)[keyof typeof FRAME_TYPES];

export type PodStatus = (typeof STATUS)[keyof typeof STATUS];

export type LogLevel = (typeof LOG_LEVELS)[keyof typeof LOG_LEVELS];

export type LogFormat = (typeof LOG_FORMAT)[keyof typeof LOG_FORMAT];
