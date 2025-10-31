import type { TreeItemSlotProps } from "@mui/x-tree-view";
import type { JSX, RefObject } from "react";
import type { TypedOptions } from "typed.js";
import { FRAME_TYPES, ITEM_IDS, SIMULATORS, STATUS } from "../utils/constants";
import type {
  TourConfigSimTarget,
  TourLogSimTarget,
  TourStatusTarget,
  TourTerminalTarget,
} from "./configTypesScratch";
import type {
  EngineConfigTarget,
  EngineLogsTarget,
  EngineStatusTarget,
  EngineTerminalTarget,
} from "./engineTypesScratch";

export type View = string;
export type StepItemId = (typeof ITEM_IDS)[keyof typeof ITEM_IDS];

export type BigContentModalType = "contact" | "finished" | "results";

export type BigContentModalContentProps = {
  handleClose: () => void;
};

export interface ViewTreeItem {
  label: string;
  content?: JSX.Element | null;
  slotProps?: TreeItemSlotProps & { label?: { subLabel?: string } };
}

export interface ViewTreeItemProps extends ViewTreeItem {
  itemId: StepItemId;
  subSteps?: Omit<ViewTreeItemProps, "subSteps">[];
}

export type StepItemMap = Record<StepItemId, ViewTreeItem>;

export type ViewStep = { stepId: StepItemId; subStepIds?: StepItemId[] };

export type ViewStepOrder = ViewStep[];

export interface NavigationState {
  view: View;
  step?: StepItemId;
  subStep?: StepItemId;
  bigContentModal?: BigContentModalType;
}

export type AnimationState = number;

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

export interface Service {
  name: string;
  namespace: string;
  replicas?: number;
  skipStartup?: boolean;
  noSuffix?: boolean;
}
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

export interface ConfigTextProps {
  files: Record<string, FileConfig>;
  activeFileTitle?: string;
}

export type LineToggles = Record<number, boolean>;
export interface FileConfig {
  text?: string;
  changes?: LineChangeBlock[];
  href?: string;
  initialLineToggles?: LineToggles;
  showToggleButtons?: boolean;
}

export interface TextGroup {
  lines: ProcessedLine[];
  startLineNo: number;
  endLineNo: number;
  isChangeBlock: boolean;
  isGap?: boolean;
}

export interface ConfigSimulatorTabContent {
  title: string;
  href?: string;
  textGroups: TextGroup[];
  pulsedLines: Set<number>;
  showToggleButtons: boolean | undefined;
  containerRef: React.RefObject<HTMLDivElement | null>;
  toggleLineValue: (lineNos: number[]) => void;
}

export type ProcessedLine = {
  lineNo: number;
  content: string;
  isHighlighted: boolean;
  hasChange?: boolean;
  newValue?: string;
  showingNewValue?: boolean;
  isGap?: boolean;
};

export interface TerminalTypedOptions extends TypedOptions {
  prompt?: string;
}

export interface TerminalTypedProps {
  typedOptions?: TerminalTypedOptions[];
  style?: React.CSSProperties;
  className?: string;
  contextLabel?: string;
}

export interface StatusProps {
  contextLabel?: string;
  services?: Service[];
}

export interface LogSimulatorProps {
  logRecords?: LogRecord[];
  speed?: number;
  errorLogs?: LogRecord[];
  errorFrequency?: number;
  isPaused?: boolean;
  contextLabel?: string;
}

type WithPanelState<T> = T & {
  active?: boolean;
};

export interface SimulatorPanelState {
  config: WithPanelState<ConfigTextProps> | null;
  terminal: WithPanelState<TerminalTypedProps> | null;
  status: WithPanelState<StatusProps> | null;
  logs: WithPanelState<LogSimulatorProps> | null;
  banner: InfoBannerProps | null;
}

export interface AnimationAction {
  type: "state_update" | "delay";
  delay?: number;
  stateChanges?: DeepPartial<SimulatorPanelState>;
}

export interface StepDefinition {
  initialState: SimulatorPanelState;
  animations: AnimationAction[];
}

export type StepDefinitions = Record<StepItemId, StepDefinition>;

export type InfoBannerProps = {
  percentText?: string;
  showPercentFiltered?: boolean;
  logs: {
    sentToVendor: number;
    filtered: number;
  };
};
export interface TourState {
  navigation: NavigationState;
  animationIndex: number;
  activeTab?: string;
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
  "delay" | "clear"
>];
export type SimulatorType = (typeof SIMULATORS)[Exclude<
  keyof typeof SIMULATORS,
  "BANNER"
>];
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
      Pick<EngineLogsTarget, "records">
    >;
    [FRAME_TYPES.STREAM]: FrameConfig<TourLogSimTarget, EngineLogsTarget>;
    [FRAME_TYPES.PAUSE]: FrameConfig<undefined, undefined>;
    [FRAME_TYPES.RESUME]: FrameConfig<TourLogSimTarget, EngineLogsTarget>;
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
    | ClearSimulatorsFrame;
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
