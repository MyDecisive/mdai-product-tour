import type { FRAME_TYPES, SIMULATORS, STATUS } from "../utils/constants";

export type Simulator = (typeof SIMULATORS)[keyof typeof SIMULATORS];

export type Frame = (typeof FRAME_TYPES)[keyof typeof FRAME_TYPES];

export type PodStatus = (typeof STATUS)[keyof typeof STATUS];
