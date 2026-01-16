import type { FRAME_TYPES, SIMULATORS, STATUS } from "../utils/constants";

export type SimulatorType = (typeof SIMULATORS)[keyof typeof SIMULATORS];

export type FrameType = (typeof FRAME_TYPES)[keyof typeof FRAME_TYPES];

export type PodStatusType = (typeof STATUS)[keyof typeof STATUS];
