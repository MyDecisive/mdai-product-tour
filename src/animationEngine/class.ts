import { FRAME_TYPES, SIMULATORS, STATUS } from "../utils/constants";
import type {
  EngineLogsTarget,
  EngineTargetState,
  LineGroup,
  PodId,
} from "../utils/engineTypesScratch";
import {
  addConfigTarget,
  addLogsRecords,
  addStatusPods,
  addTerminalStrings,
  removeStatusPods,
  setConfigActiveTab,
  setConfigScrollTarget,
  setLogsContextLabel,
  setTerminalContentPrinted,
  toggleConfigPulseGroup,
  toggleConfigShowingChange,
  updateBannerState,
  updatePodStatus,
} from "../utils/frameStateMergeStrategies";
import { createLogRecord, findReplacementPod } from "../utils/transformHelpers";
import type {
  ConfigSimScrollTarget,
  EngineFrames,
  LogRecord,
  PodStatusType,
  SimulatorHandlerMap,
  SimulatorType,
} from "../utils/types";

export interface EngineCallbacks {
  onStateChange: (state: EngineTargetState) => void;
  onActiveSimulatorChange: (simulator: SimulatorType | null) => void;
  onComplete: () => void;
}

export class AnimationEngineInstance {
  private actions: EngineFrames["Any"][];
  private startState: EngineTargetState;
  private targetState: EngineTargetState;
  private callbacks: EngineCallbacks;

  private currentState: EngineTargetState;
  private isRunning = false;
  private timeouts: NodeJS.Timeout[] = [];
  private currentActionResolver: (() => void) | null = null;

  private podsToRemove: Set<PodId> = new Set();
  private podRemovalTimer: NodeJS.Timeout | null = null;

  private logsIntervalRef: ReturnType<typeof setInterval> | null = null;
  private logsStopTimeoutRef: ReturnType<typeof setTimeout> | null = null;
  private logsCycleCount = 0;
  private logsCurrentIndex = 0;

  private configScrollResolvers = new Map<string, () => void>();
  private configPulseGroupTimeouts: ReturnType<typeof setTimeout>[] = [];

  constructor(
    actions: EngineFrames["Any"][],
    startState: EngineTargetState,
    targetState: EngineTargetState,
    callbacks: EngineCallbacks
  ) {
    this.actions = actions;
    this.startState = startState;
    this.targetState = targetState;
    this.callbacks = callbacks;
    this.currentState = { ...startState };
  }

  advanceAnimation() {
    if (this.currentActionResolver) {
      this.currentActionResolver();
      this.currentActionResolver = null;
    }
  }

  async play() {
    this.isRunning = true;

    for (const action of this.actions) {
      if (!this.isRunning) break;
      await this.executeAction(action);
    }

    if (this.isRunning) {
      this.currentState = { ...this.targetState };
      this.callbacks.onStateChange(this.currentState);
      this.callbacks.onActiveSimulatorChange(null);
      this.callbacks.onComplete();
    }
  }

  reset() {
    this.cleanup();
    this.currentState = { ...this.startState };
    this.callbacks.onStateChange(this.currentState);
    this.callbacks.onActiveSimulatorChange(null);
  }

  cleanup() {
    this.isRunning = false;

    this.timeouts.forEach(clearTimeout);
    if (this.podRemovalTimer) {
      clearTimeout(this.podRemovalTimer);
    }
    this.configPulseGroupTimeouts.forEach(clearTimeout);
    if (this.logsIntervalRef) {
      clearInterval(this.logsIntervalRef);
    }

    this.timeouts = [];
    this.currentActionResolver = null;

    this.logsCurrentIndex = 0;
    this.logsCycleCount = 0;

    this.configScrollResolvers.clear();
    this.configPulseGroupTimeouts = [];
  }

  private readonly frameHandlers: SimulatorHandlerMap = {
    [SIMULATORS.TERMINAL]: {
      [FRAME_TYPES.ENTER_COMMAND]: (frame) => {
        this.updateState(addTerminalStrings, frame.updates);
      },
    },
    [SIMULATORS.STATUS]: {
      [FRAME_TYPES.ADD_SERVICES]: (frame) => {
        this.updateState(addStatusPods, frame.updates);
      },
    },
    [SIMULATORS.CONFIG]: {
      [FRAME_TYPES.ADD]: (frame) => {
        this.updateState(addConfigTarget, frame.updates);
      },
      [FRAME_TYPES.SCROLL_TO]: (frame) => {
        void this.configScrollAndToggle(frame.updates);
      },
    },
    [SIMULATORS.LOGS]: {
      [FRAME_TYPES.ADD]: (frame) => {
        this.updateState(addLogsRecords, frame.updates);
      },
      [FRAME_TYPES.STREAM]: (frame) => {
        this.logsStream(frame.updates);
      },
      [FRAME_TYPES.PAUSE]: () => {
        this.logsPause();
      },
    },
    [SIMULATORS.BANNER]: {
      [FRAME_TYPES.UPDATE]: (frame) => {
        this.updateState(updateBannerState, frame.updates);
      },
    },
  };

  public async executeAction(action: EngineFrames["Any"]): Promise<void> {
    if (action.type === FRAME_TYPES.DELAY) {
      await this.delay(action.duration);
      return;
    }

    if (action.type === FRAME_TYPES.CLEAR) {
      this.clearStatePerSimulator(action.simulators);
      return;
    }

    const { simulator } = action;
    // TODO: figure out how to ignore or omit advanceAnimation calls when
    // waitForComplete = false
    if (action.waitForComplete) {
      this.callbacks.onActiveSimulatorChange(simulator);
    }

    if (action.type === FRAME_TYPES.ACTIVATE) {
      // duration is enforced in transformTourToEngineAnimation
      await this.delay(action.duration!);
      this.callbacks.onActiveSimulatorChange(simulator);
      return;
    }

    const waitForCompletion = action.waitForComplete
      ? new Promise<void>((resolve) => {
          this.currentActionResolver = resolve;
        })
      : Promise.resolve();

    const simHandlers =
      this.frameHandlers[action.simulator as keyof typeof this.frameHandlers];
    const handler = simHandlers?.[action.type as keyof typeof simHandlers] as
      | ((frame: typeof action) => void)
      | undefined;

    if (handler) {
      handler(action);
    }

    await waitForCompletion;
  }

  // ----------------------------------------------------------------------------
  // Terminal sim methods
  // ----------------------------------------------------------------------------

  public setTerminalContentPrinted(index: number) {
    this.updateState(setTerminalContentPrinted, index);

    if (this.currentState.terminal!.strings.every((str) => str.printed)) {
      this.callbacks.onActiveSimulatorChange(SIMULATORS.TERMINAL);
      this.advanceAnimation();
    }
  }

  // ----------------------------------------------------------------------------
  // Status sim methods
  // ----------------------------------------------------------------------------

  private allPodsRunning(): boolean {
    const pods = Object.values(this.currentState.status?.activePods || {});

    return pods.length > 0 && pods.every((pod) => pod.status === "Running");
  }

  private statusPodReachedRunning(podId: PodId): void {
    const activePods = this.currentState.status!.activePods;
    const pod = activePods[podId];

    const replacementPod = findReplacementPod(pod, activePods);

    if (replacementPod) {
      this.onPodStatusChange(replacementPod.id, STATUS.terminating);
    } else if (this.allPodsRunning()) {
      this.callbacks.onActiveSimulatorChange(SIMULATORS.STATUS);
      this.advanceAnimation();
    }
  }

  private schedulePodRemoval(podId: PodId): void {
    this.podsToRemove.add(podId);

    if (this.podRemovalTimer) {
      clearTimeout(this.podRemovalTimer);
    }

    this.podRemovalTimer = setTimeout(() => {
      this.executePodRemovals();
      if (this.allPodsRunning()) {
        this.callbacks.onActiveSimulatorChange(SIMULATORS.STATUS);
        this.advanceAnimation();
      }
    }, 1000 - this.podsToRemove.size * 100);
  }

  private executePodRemovals(): void {
    this.updateState<Set<string>>(removeStatusPods, this.podsToRemove);
    this.podsToRemove.clear();
  }

  public onPodStatusChange(podId: PodId, newStatus: PodStatusType): void {
    const incrementRestarts = newStatus === STATUS.crashLoopBackoff;
    this.updateState<{
      podId: string;
      status: PodStatusType;
      incrementRestarts: boolean;
    }>(updatePodStatus, {
      podId,
      status: newStatus,
      incrementRestarts,
    });

    if (newStatus === STATUS.running) {
      this.statusPodReachedRunning(podId);
    } else if (newStatus === STATUS.shutdown) {
      void this.schedulePodRemoval(podId);
    }
  }

  // ----------------------------------------------------------------------------
  // Config sim methods
  // ----------------------------------------------------------------------------
  public onSetActiveTab(tabName: string) {
    this.updateState<string>(setConfigActiveTab, tabName);
  }

  public onToggleShowingChange(groupId: string): void {
    this.updateState<string>(toggleConfigShowingChange, groupId);
  }

  private pulseGroup(groupId: string): void {
    this.updateState<string>(toggleConfigPulseGroup, groupId);

    const timeoutId = setTimeout(() => {
      this.updateState<string>(toggleConfigPulseGroup, groupId);
    }, 1500);

    this.configPulseGroupTimeouts.push(timeoutId);
  }

  private async configScrollAndToggle({
    fileName,
    line,
    scrollOnly,
  }: ConfigSimScrollTarget): Promise<void> {
    const file = this.currentState.config?.files[fileName];
    if (!file) return;

    const group = file.groups.find((grp) => {
      if (grp.type !== "group") return false;
      return grp.start <= line && line <= grp.end;
    }) as LineGroup | undefined;

    if (!group?.groupId) return;

    this.onSetActiveTab(fileName);
    await this.delay(50);

    const scrollId = `scroll-${Date.now()}`;
    const scrollPromise = new Promise<void>((resolve) => {
      this.configScrollResolvers.set(scrollId, resolve);
    });

    this.updateState(setConfigScrollTarget, {
      id: scrollId,
      fileName,
      groupId: group.groupId,
      line,
    });

    await scrollPromise;

    if (!scrollOnly) {
      this.onToggleShowingChange(group.groupId);
      this.pulseGroup(group.groupId);
      await this.delay(300);
    }

    this.advanceAnimation();
  }

  public onConfigScrollComplete = (scrollId: string): void => {
    const resolve = this.configScrollResolvers.get(scrollId);
    if (resolve) {
      resolve();
      this.configScrollResolvers.delete(scrollId);
    }

    this.updateState(setConfigScrollTarget, undefined);
  };

  // ----------------------------------------------------------------------------
  // Logs sim methods
  // ----------------------------------------------------------------------------
  private getNextLog(
    records: LogRecord[],
    errorRecords: LogRecord[],
    errorFrequency: number
  ): LogRecord {
    const shouldError =
      errorRecords.length > 0 && Math.random() < errorFrequency;

    if (shouldError) {
      const randomIdx = Math.floor(Math.random() * errorRecords.length);
      return createLogRecord(errorRecords[randomIdx], -1, -1, true);
    }

    const logIndex = this.logsCurrentIndex % records.length;
    const nextLog = createLogRecord(
      records[logIndex],
      this.logsCycleCount,
      logIndex,
      false
    );

    this.logsCurrentIndex++;
    if (this.logsCurrentIndex >= records.length) {
      this.logsCycleCount++;
      this.logsCurrentIndex = 0;
    }

    return nextLog;
  }

  private logsStream({
    records,
    speed,
    errorRecords,
    errorFrequency,
    duration,
    contextLabel,
  }: EngineLogsTarget & { duration: number }): void {
    if (this.logsIntervalRef) {
      clearInterval(this.logsIntervalRef);
      this.logsIntervalRef = null;
    }
    if (this.logsStopTimeoutRef) {
      clearTimeout(this.logsStopTimeoutRef);
      this.logsStopTimeoutRef = null;
    }

    this.logsCycleCount = 0;
    this.logsCurrentIndex = 0;

    // short-circuit if nothing to do
    if (!records || records.length === 0 || duration <= 0 || speed <= 0) {
      return;
    }

    this.updateState<string | undefined>(setLogsContextLabel, contextLabel);

    const emitOne = () => {
      const nextLog = this.getNextLog(records, errorRecords, errorFrequency);

      this.updateState<{ records: LogRecord[] }>(addLogsRecords, {
        records: [nextLog],
      });
    };

    emitOne();
    this.logsIntervalRef = setInterval(emitOne, speed);

    this.logsStopTimeoutRef = setTimeout(() => {
      if (this.logsIntervalRef) {
        clearInterval(this.logsIntervalRef);
        this.logsIntervalRef = null;
      }
      this.logsStopTimeoutRef = null;
      this.callbacks.onActiveSimulatorChange(SIMULATORS.LOGS);
      this.advanceAnimation();
    }, duration);
  }

  private logsPause(): void {
    if (this.logsIntervalRef) {
      clearInterval(this.logsIntervalRef);
      this.logsIntervalRef = null;
    }
    if (this.logsStopTimeoutRef) {
      clearTimeout(this.logsStopTimeoutRef);
      this.logsStopTimeoutRef = null;
    }
  }
  // ----------------------------------------------------------------------------
  // Generic/Helper methods
  // ----------------------------------------------------------------------------
  private updateState<T>(
    updateFn: (
      currentState: EngineTargetState,
      updates: T
    ) => EngineTargetState,
    updates: T
  ): void {
    const newState = updateFn(this.currentState, updates);
    this.currentState = newState;
    this.callbacks.onStateChange(this.currentState);
  }

  private clearStatePerSimulator(simulators: SimulatorType[]) {
    this.currentState = Object.fromEntries(
      Object.entries(this.currentState || {}).filter(
        ([k]) => !simulators.includes(k as SimulatorType)
      )
    );
    this.callbacks.onStateChange(this.currentState);
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => {
      const timeout = setTimeout(resolve, ms);
      this.timeouts.push(timeout);
    });
  }
}
