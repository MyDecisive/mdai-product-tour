import {
  createNextLog,
  selectErrorPropLog,
  shouldInjectError,
} from "../hooks/useGetLogsSimulatorContent";
import { FRAME_TYPES, SIMULATORS, STATUS } from "../utils/constants";
import type {
  EngineLogsTarget,
  EngineTargetState,
  LineGroup,
  PodId,
} from "../utils/engineTypesScratch";
import type {
  EngineFrames,
  LogRecord,
  PodStatusType,
  SimulatorHandlerMap,
  SimulatorType,
} from "../utils/types";
import { POD_NAME_DELIM } from "./configToEngineTransforms";
import {
  addConfigTarget,
  addLogsRecords,
  addStatusPods,
  addTerminalStrings,
  removeStatusPods,
  setConfigActiveTab,
  toggleConfigShowingChange,
  updatePodStatus,
} from "./frameStateMergeStrategies";

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
  private podAnimationResolvers: Map<PodId, () => void> = new Map();

  private podsToRemove: Set<PodId> = new Set();
  private podRemovalTimer: NodeJS.Timeout | null = null;

  private logsIntervalRef: NodeJS.Timeout | null = null;
  private logsCurrentIndex: number = 0;
  private logsCycleCount: number = 0;

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
    this.timeouts = [];
    this.podAnimationResolvers.clear();
    this.currentActionResolver = null;
    if (this.logsIntervalRef) {
      clearInterval(this.logsIntervalRef);
    }
    this.logsCurrentIndex = 0;
    this.logsCycleCount = 0;
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
        void this.statusAnimateStartup();
      },
    },
    [SIMULATORS.CONFIG]: {
      [FRAME_TYPES.ADD]: (frame) => {
        this.updateState(addConfigTarget, frame.updates);
      },
      [FRAME_TYPES.SCROLL_TO]: (frame) => {
        const config = this.currentState.config;
        const { fileName, line } = frame.updates;
        if (!config || !config.files[fileName]) {
          return;
        }

        const file = config.files[fileName];

        const { groupId } = (file.groups.find((grp) => {
          const isLineGroup = grp.type === "group";
          if (!isLineGroup) {
            return;
          }
          return grp.start <= line && line <= grp.end;
        }) || {}) as LineGroup;

        if (!groupId) {
          return;
        }

        this.onSetActiveTab(fileName);
        this.onToggleShowingChange(groupId);
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
      [FRAME_TYPES.RESUME]: (frame) => {
        this.logsStream(frame.updates, true);
      },
    },
  };

  private async executeAction(action: EngineFrames["Any"]): Promise<void> {
    if (action.type === FRAME_TYPES.DELAY) {
      await this.delay(action.duration);
      return;
    }

    if (action.type === FRAME_TYPES.CLEAR) {
      this.clearStatePerSimulator(action.simulators);
      return;
    }

    const { simulator } = action;
    if (action.waitForComplete) {
      this.callbacks.onActiveSimulatorChange(simulator);
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
  // Status sim methods
  // ----------------------------------------------------------------------------

  private statusPodReachedRunning(podId: PodId): void {
    const activePods = this.currentState.status!.activePods;
    const pod = activePods[podId];

    const replacementPod = Object.values(activePods).find((active) => {
      const differentPodSource =
        active.parentServiceKey !== pod.parentServiceKey;
      const sameNamespace = active.namespace === pod.namespace;

      const podNameDelimIdx = active.name.lastIndexOf(POD_NAME_DELIM);

      const sameService = pod.name.startsWith(
        active.name.substring(0, podNameDelimIdx)
      );
      const activeIsRunning = active.status === STATUS.running;

      return (
        differentPodSource && sameNamespace && sameService && activeIsRunning
      );
    });

    if (replacementPod) {
      this.onPodStatusChange(replacementPod.id, STATUS.terminating);
    }
  }

  private schedulePodRemoval(podId: PodId): void {
    this.podsToRemove.add(podId);

    if (this.podRemovalTimer) {
      clearTimeout(this.podRemovalTimer);
    }

    this.podRemovalTimer = setTimeout(() => {
      this.executePodRemovals();
    }, 1000 - this.podsToRemove.size * 100);
  }

  private executePodRemovals(): void {
    this.updateState<Set<string>>(removeStatusPods, this.podsToRemove);
    this.podsToRemove.clear();
  }

  private async statusAnimateStartup(): Promise<void> {
    const podIds = this.currentState.status?.podOrder;
    if (!podIds || podIds.length === 0) {
      return;
    }
    const animationPromises = podIds.map((podId) => {
      const pod = this.currentState.status!.activePods[podId];

      if (pod.status === STATUS.running) {
        return Promise.resolve();
      }

      return new Promise<void>((resolve) => {
        this.podAnimationResolvers.set(podId, resolve);
      });
    });

    await Promise.all(animationPromises);
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
      const resolver = this.podAnimationResolvers.get(podId);
      if (resolver) {
        resolver();
        this.podAnimationResolvers.delete(podId);
      }
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

  // ----------------------------------------------------------------------------
  // Logs sim methods
  // ----------------------------------------------------------------------------
  private logsStream(
    { records, speed, errorRecords, errorFrequency }: EngineLogsTarget,
    resume?: boolean
  ): void {
    if (this.logsIntervalRef) {
      clearInterval(this.logsIntervalRef);
    }
    if (!resume) {
      this.logsCycleCount = 0;
      this.logsCurrentIndex = 0;
    }

    this.logsIntervalRef = setInterval(() => {
      let nextLog: LogRecord;
      if (shouldInjectError(errorRecords.length > 0, errorFrequency)) {
        const propLog = selectErrorPropLog(errorRecords);
        nextLog = createNextLog(propLog, null, null);
      } else {
        const logIndex = this.logsCurrentIndex % records.length;
        const propLog = records[logIndex];
        nextLog = createNextLog(propLog, this.logsCycleCount, logIndex);

        this.logsCurrentIndex++;
        if (this.logsCurrentIndex >= records.length) {
          this.logsCycleCount++;
          this.logsCurrentIndex = 0;
        }
      }

      this.updateState<{ records: LogRecord[] }>(addLogsRecords, {
        records: [nextLog],
      });
    }, speed);
  }

  private logsPause(): void {
    if (this.logsIntervalRef) {
      clearInterval(this.logsIntervalRef);
      this.logsIntervalRef = null;
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
