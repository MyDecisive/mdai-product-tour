import { FRAME_TYPES, SIMULATORS } from "../utils/constants";
import type * as Kinds from "./kinds";
import type { LogsContext, Player, ScrollTarget } from "./player";

export type ConstructedFrameKind = Exclude<
  Kinds.Frame,
  | typeof FRAME_TYPES.DELAY
  | typeof FRAME_TYPES.CLEAR
  | typeof FRAME_TYPES.ACTIVATE
>;

export type Frame<
  S extends Kinds.Simulator = Kinds.Simulator,
  T extends ConstructedFrameKind = ConstructedFrameKind,
  U = undefined,
> = BaseFrame & { simulator: S; kind: T } & ([undefined] extends [U]
    ? { updates?: Exclude<U, undefined> }
    : { updates: U });

/**
 * waitForComplete - defaults to true
 */
export interface BaseFrame {
  waitForComplete?: boolean;
  kind: Kinds.Frame;
}

export interface DelayFrame extends BaseFrame {
  kind: typeof FRAME_TYPES.DELAY;
  duration: number;
}

export interface ClearSimulatorsFrame extends BaseFrame {
  kind: typeof FRAME_TYPES.CLEAR;
  simulators: Kinds.Simulator[];
}

export interface ActivateSimulatorFrame extends BaseFrame {
  kind: typeof FRAME_TYPES.ACTIVATE;
  simulator: Kinds.Simulator;
  duration: number;
}

export type FrameConfigs = {
  [SIMULATORS.TERMINAL]: {
    [FRAME_TYPES.ENTER_COMMAND]: NonNullable<Player["terminal"]>;
  };
  [SIMULATORS.STATUS]: {
    [FRAME_TYPES.ADD_SERVICES]: NonNullable<Player["status"]>;
  };
  [SIMULATORS.CONFIG]: {
    [FRAME_TYPES.ADD]: NonNullable<Player["config"]>;
    [FRAME_TYPES.SCROLL_TO]: ScrollTarget;
  };
  [SIMULATORS.LOGS]: {
    [FRAME_TYPES.ADD]: LogsContext & { duration: number };
    [FRAME_TYPES.STREAM]: LogsContext & { duration: number };
    [FRAME_TYPES.PAUSE]: undefined;
  };
  [SIMULATORS.BANNER]: {
    [FRAME_TYPES.UPDATE]: NonNullable<Player["banner"]>;
  };
};

type FramesForSim<Sim extends keyof FrameConfigs> = {
  [F in keyof FrameConfigs[Sim]]: Frame<
    Extract<Sim, Kinds.Simulator>,
    Extract<F, ConstructedFrameKind>,
    FrameConfigs[Sim][F]
  >;
};

type FrameUnionForSim<Sim extends keyof FrameConfigs> =
  FramesForSim<Sim>[keyof FrameConfigs[Sim]];

export type AnyFrame =
  | {
      [S in keyof FrameConfigs]: FrameUnionForSim<S>;
    }[keyof FrameConfigs]
  | DelayFrame
  | ClearSimulatorsFrame
  | ActivateSimulatorFrame;
