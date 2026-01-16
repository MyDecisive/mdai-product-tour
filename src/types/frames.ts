import { FRAME_TYPES, SIMULATORS } from "../utils/constants";
import type * as Kinds from "./kinds";
import type { EngineLogsContext, EngineTargetState } from "./player";

export type ConstructedFrameKind = Exclude<
  Kinds.FrameType,
  | typeof FRAME_TYPES.DELAY
  | typeof FRAME_TYPES.CLEAR
  | typeof FRAME_TYPES.ACTIVATE
>;

export type Frame<
  S extends Kinds.SimulatorType = Kinds.SimulatorType,
  T extends ConstructedFrameKind = ConstructedFrameKind,
  U = unknown
> = [U] extends [undefined]
  ? BaseFrame & { simulator: S; type: T; updates?: U }
  : BaseFrame & { simulator: S; type: T; updates: U };

/**
 * waitForComplete - defaults to true
 */
export interface BaseFrame {
  waitForComplete?: boolean;
  type: Kinds.FrameType;
}

export interface DelayFrame extends BaseFrame {
  type: typeof FRAME_TYPES.DELAY;
  duration: number;
}

export interface ClearSimulatorsFrame extends BaseFrame {
  type: typeof FRAME_TYPES.CLEAR;
  simulators: Kinds.SimulatorType[];
}

export interface ActivateSimulatorFrame extends BaseFrame {
  type: typeof FRAME_TYPES.ACTIVATE;
  simulator: Kinds.SimulatorType;
  duration: number;
}

export interface ConfigSimScrollTarget {
  fileName: string;
  line: number;
  scrollOnly?: boolean;
}

export type SimulatorFrameConfigs = {
  [SIMULATORS.TERMINAL]: {
    [FRAME_TYPES.ENTER_COMMAND]: NonNullable<EngineTargetState["terminal"]>;
  };
  [SIMULATORS.STATUS]: {
    [FRAME_TYPES.ADD_SERVICES]: NonNullable<EngineTargetState["status"]>;
  };
  [SIMULATORS.CONFIG]: {
    [FRAME_TYPES.ADD]: NonNullable<EngineTargetState["config"]>;
    [FRAME_TYPES.SCROLL_TO]: ConfigSimScrollTarget;
  };
  [SIMULATORS.LOGS]: {
    [FRAME_TYPES.ADD]: EngineLogsContext & { duration: number };
    [FRAME_TYPES.STREAM]: EngineLogsContext & { duration: number };
    [FRAME_TYPES.PAUSE]: undefined;
  };
  [SIMULATORS.BANNER]: {
    [FRAME_TYPES.UPDATE]: NonNullable<EngineTargetState["banner"]>;
  };
};

type FramesForSim<Sim extends keyof SimulatorFrameConfigs> = {
  [F in keyof SimulatorFrameConfigs[Sim]]: Frame<
    Extract<Sim, Kinds.SimulatorType>,
    Extract<F, ConstructedFrameKind>,
    SimulatorFrameConfigs[Sim][F]
  >;
};

type FrameUnionForSim<Sim extends keyof SimulatorFrameConfigs> =
  FramesForSim<Sim>[keyof SimulatorFrameConfigs[Sim]];

export type AnyFrame =
  | {
      [S in keyof SimulatorFrameConfigs]: FrameUnionForSim<S>;
    }[keyof SimulatorFrameConfigs]
  | DelayFrame
  | ClearSimulatorsFrame
  | ActivateSimulatorFrame;
