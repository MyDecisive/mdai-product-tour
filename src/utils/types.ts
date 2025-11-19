import type { RefObject } from "react";
import type { TypedOptions } from "typed.js";
import { FRAME_TYPES, SIMULATORS, STATUS } from "../utils/constants";
import type {
  ContentBlock,
  TourConfigSimTarget,
  TourLogSimTarget,
  TourStatusTarget,
  TourTerminalTarget,
} from "./configTypesScratch";
import type {
  EngineConfigTarget,
  EngineLogsTarget,
  EngineStatusTarget,
  EngineTargetState,
  EngineTerminalTarget,
} from "./engineTypesScratch";

export type BigContentModalType = "contact" | "finished" | "results";

export type BigContentModalContentProps = {
  handleClose: () => void;
};

export interface NavigationState {
  tour: string;
  step: number;
  subStep: number;
  bigContentModal: BigContentModalType | null;
}

export type SimulatorBoxProps = {
  title: string;
  link?: string;
  href?: string;
  styles?: React.CSSProperties;
  innerStyles?: React.CSSProperties;
  children?: React.ReactNode;
  active?: boolean;
  ref?: RefObject<HTMLDivElement | null>;
};

export interface LogRecord {
  message?: string;
  content?: string;
  level?: string;
  timestamp?: string;
  id?: string;
  [key: string]: unknown;
}

export type LineChangeBlock = {
  start: number;
  end?: number;
  changeLines: string[];
};

export interface BannerTargetState {
  text: string;
  logsSent: number;
  logsFiltered: number;
}

export interface TerminalTypedOptions extends TypedOptions {
  prompt?: string;
  printed: boolean;
}

export type DeepPartial<T> = Partial<{
  [P in keyof T]: T[P] extends object
    ? T[P] extends Array<infer U>
      ? Array<DeepPartial<U>>
      : DeepPartial<T[P]>
    : Partial<T[P]>;
}>;

export type FrameType = (typeof FRAME_TYPES)[Exclude<
  keyof typeof FRAME_TYPES,
  "delay" | "clear" | "activate"
>];
export type SimulatorType = (typeof SIMULATORS)[keyof typeof SIMULATORS];
export type PodStatusType = (typeof STATUS)[keyof typeof STATUS];

interface BaseFrame {
  waitForComplete?: boolean; // Defaults to true
  type: (typeof FRAME_TYPES)[keyof typeof FRAME_TYPES];
}

export type Frame<
  S extends SimulatorType = SimulatorType,
  T extends FrameType = FrameType,
  U = unknown
> = [U] extends [undefined]
  ? BaseFrame & { simulator: S; type: T; updates?: U }
  : BaseFrame & { simulator: S; type: T; updates: U };

export interface DelayFrame extends BaseFrame {
  type: typeof FRAME_TYPES.DELAY;
  duration: number;
}

export interface ClearSimulatorsFrame extends BaseFrame {
  type: typeof FRAME_TYPES.CLEAR;
  simulators: SimulatorType[];
}

export interface ActivateSimulatorFrame extends BaseFrame {
  type: typeof FRAME_TYPES.ACTIVATE;
  simulator: SimulatorType;
  duration?: number;
}

type FrameConfig<TourUpdates, EngineUpdates> = {
  tour: TourUpdates;
  engine: EngineUpdates;
};

export type ConfigSimScrollTarget = {
  fileName: string;
  line: number;
};

// This is the source of truth for available frames
export type SimulatorFrameConfigs = {
  [SIMULATORS.TERMINAL]: {
    [FRAME_TYPES.ENTER_COMMAND]: FrameConfig<
      TourTerminalTarget[],
      EngineTerminalTarget
    >;
  };
  [SIMULATORS.STATUS]: {
    [FRAME_TYPES.ADD_SERVICES]: FrameConfig<
      TourStatusTarget[],
      EngineStatusTarget
    >;
  };
  [SIMULATORS.CONFIG]: {
    [FRAME_TYPES.ADD]: FrameConfig<TourConfigSimTarget, EngineConfigTarget>;
    [FRAME_TYPES.SCROLL_TO]: FrameConfig<
      ConfigSimScrollTarget,
      ConfigSimScrollTarget
    >;
  };
  [SIMULATORS.LOGS]: {
    [FRAME_TYPES.ADD]: FrameConfig<
      Pick<TourLogSimTarget, "logsSources">,
      EngineLogsTarget & { duration: number }
    >;
    [FRAME_TYPES.STREAM]: FrameConfig<
      TourLogSimTarget & { duration?: number },
      EngineLogsTarget & { duration: number }
    >;
    [FRAME_TYPES.PAUSE]: FrameConfig<undefined, undefined>;
  };
  [SIMULATORS.BANNER]: {
    [FRAME_TYPES.UPDATE]: FrameConfig<BannerTargetState, BannerTargetState>;
  };
};

type ModeKey = "tour" | "engine";

type ModePayload<
  SimName extends keyof SimulatorFrameConfigs,
  FrameTypeName extends keyof SimulatorFrameConfigs[SimName],
  M extends ModeKey
> = SimulatorFrameConfigs[SimName][FrameTypeName] extends Record<M, infer V>
  ? V
  : never;

type GenerateFrameTypes<
  Mode extends ModeKey,
  SimName extends keyof SimulatorFrameConfigs
> = {
  [FType in keyof SimulatorFrameConfigs[SimName]]: Frame<
    Extract<SimName, SimulatorType>,
    Extract<FType, FrameType>,
    ModePayload<SimName, FType, Mode>
  >;
} & {
  All: {
    [FType in keyof SimulatorFrameConfigs[SimName]]: Frame<
      Extract<SimName, SimulatorType>,
      Extract<FType, FrameType>,
      ModePayload<SimName, FType, Mode>
    >;
  }[keyof SimulatorFrameConfigs[SimName]];
};

type GenerateNamespace<Mode extends "tour" | "engine"> = {
  [SimName in keyof SimulatorFrameConfigs]: GenerateFrameTypes<Mode, SimName>;
} & {
  Any:
    | {
        [SimName in keyof SimulatorFrameConfigs]: GenerateFrameTypes<
          Mode,
          SimName
        >["All"];
      }[keyof SimulatorFrameConfigs]
    | DelayFrame
    | ClearSimulatorsFrame
    | ActivateSimulatorFrame;
};

export type TourFrames = GenerateNamespace<"tour">;
export type EngineFrames = GenerateNamespace<"engine">;

type FrameHandler<
  SimName extends keyof SimulatorFrameConfigs,
  FType extends keyof SimulatorFrameConfigs[SimName]
> = SimulatorFrameConfigs[SimName][FType] extends FrameConfig<
  unknown,
  infer EngineUpdates
>
  ? (
      frame: Frame<
        Extract<SimName, SimulatorType>,
        Extract<FType, FrameType>,
        EngineUpdates
      >
    ) => void
  : never;

export type SimulatorHandlerMap = {
  [SimName in keyof SimulatorFrameConfigs]: {
    [FType in keyof SimulatorFrameConfigs[SimName]]: FrameHandler<
      SimName,
      FType
    >;
  };
};

type StateBuilder<
  SimName extends keyof SimulatorFrameConfigs,
  FType extends keyof SimulatorFrameConfigs[SimName]
> = SimulatorFrameConfigs[SimName][FType] extends FrameConfig<
  unknown,
  infer EngineUpdates
>
  ? (state: EngineTargetState, updates: EngineUpdates) => EngineTargetState
  : never;

export type SimulatorStateBuilderMap = {
  [SimName in keyof SimulatorFrameConfigs]: {
    [FType in keyof SimulatorFrameConfigs[SimName]]?: StateBuilder<
      SimName,
      FType
    >;
  };
};

export interface TourSelectionItem {
  id: string;
  itemId: string;
  title: string;
  subtitle?: string;
  comingSoon: boolean;
  buttonText?: string;
  onTourSelect?: () => void;
}

export interface StepItem {
  id: string;
  itemId: string;
  title: string;
  subSteps: SubStepItem[];
}

interface SubStepItem {
  id: string;
  itemId: string;
  title?: string;
  content?: ContentBlock;
}
