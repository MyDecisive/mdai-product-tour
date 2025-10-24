import {
  createNextLog,
  selectErrorPropLog,
  shouldInjectError,
} from "../hooks/useGetLogsSimulatorContent";
import { FRAME_TYPES, SIMULATORS, STATUS } from "../utils/constants";
import { deepMergeWith } from "../utils/deepMergeWith";
import type {
  EngineFrames,
  EngineLogsTarget,
  EngineStatusTarget,
  EngineTargetState,
  LineGroup,
  PodId,
} from "../utils/engineTypesScratch";
import type { DeepPartial, LogRecord, SimulatorType } from "../utils/types";
import { POD_NAME_DELIM } from "./configToEngineTransforms";

export interface EngineCallbacks {
  onStateChange: (state: EngineTargetState) => void;
  onActiveSimulatorChange: (simulator: SimulatorType | null) => void;
  onComplete: () => void;
}

export class AnimationEngineInstance {
  private actions: EngineFrames.Any[];
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
    actions: EngineFrames.Any[],
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

  private async executeAction(action: EngineFrames.Any): Promise<void> {
    if (action.type === FRAME_TYPES.delay) {
      await this.delay(action.duration);
      return;
    }

    if (action.type === FRAME_TYPES.clear) {
      // TODO: Should this have its own method to set a state node to undefined?
      this.updateState(createClearState(action.simulators));
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
    // TODO: Find a DRYer way to do this
    switch (action.type) {
      case FRAME_TYPES.enter_command:
        this.updateState({ [action.simulator]: action.updates }, true);
        break;
      case FRAME_TYPES.add_services:
        this.addStatusPods(action.updates);
        break;
      case FRAME_TYPES.add:
        if (action.simulator === SIMULATORS.LOGS) {
          this.updateState({ [action.simulator]: action.updates }, true);
          break;
        }
        this.updateState({ [action.simulator]: action.updates });
        break;
      case FRAME_TYPES.scroll_to:
        this.manageScrollTo(action.updates);
        break;
      case FRAME_TYPES.pause:
        this.logsPause();
        break;
      case FRAME_TYPES.stream:
        this.logsStream(action.updates);
        break;
      case FRAME_TYPES.resume:
        this.logsStream(action.updates, true);
        break;
    }

    await waitForCompletion;
  }

  // ----------------------------------------------------------------------------
  // Status sim methods
  // ----------------------------------------------------------------------------

  private addStatusPods({
    activePods: newPods,
    podOrder: newPodOrder,
  }: EngineStatusTarget): void {
    const currentStatus = this.currentState.status || {
      activePods: {},
      podOrder: [],
    };
    const status = { ...currentStatus };

    this.updateState({
      status: {
        activePods: { ...status.activePods, ...newPods },
        podOrder: [...status.podOrder, ...newPodOrder],
      },
    });

    void this.statusAnimateStartup();
  }

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
      // Mark the old pod for shutdown
      const status = { ...this.currentState.status };
      status.activePods![replacementPod.id].status = STATUS.terminating;
      this.updateState({ status });
    }
  }

  private scheduleRemoval(podId: PodId): void {
    this.podsToRemove.add(podId);

    if (this.podRemovalTimer) {
      clearTimeout(this.podRemovalTimer);
    }

    // TODO: make this removal timer respond to the number of pods to remove
    this.podRemovalTimer = setTimeout(() => {
      this.executeRemovals();
    }, 1000);
  }

  private executeRemovals(): void {
    const status = this.currentState.status;
    if (!status || this.podsToRemove.size === 0) {
      return;
    }

    const newPodOrder = status.podOrder.filter(
      (id) => !this.podsToRemove.has(id)
    );
    const newActivePods = { ...status.activePods };

    this.podsToRemove.forEach((podId) => {
      delete newActivePods[podId];
    });

    // updateState only handles additions and merges, we have to do this
    // in order to perform the removals correctly.
    // TODO: Create a generic `removeFromState` method
    this.currentState = {
      ...this.currentState,
      status: {
        podOrder: newPodOrder,
        activePods: newActivePods,
      },
    };

    this.callbacks.onStateChange(this.currentState);

    this.podsToRemove.clear();
    this.podRemovalTimer = null;
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

  public onPodStatusChange(
    podId: PodId,
    newStatus: (typeof STATUS)[keyof typeof STATUS]
  ): void {
    const status = { ...this.currentState.status! };
    status.activePods[podId].status = newStatus;
    if (newStatus === STATUS.crashLoopBackoff) {
      status.activePods[podId].restartCount =
        status.activePods[podId].restartCount + 1;
    }
    this.updateState({ status });

    if (newStatus === STATUS.running) {
      this.statusPodReachedRunning(podId);

      const resolver = this.podAnimationResolvers.get(podId);
      if (resolver) {
        resolver();
        this.podAnimationResolvers.delete(podId);
      }
    } else if (newStatus === STATUS.shutdown) {
      void this.scheduleRemoval(podId);
    }
  }

  // ----------------------------------------------------------------------------
  // Config sim methods
  // ----------------------------------------------------------------------------
  public onSetActiveTab(tabName: string) {
    const config = this.currentState.config;
    if (!config || !config.files[tabName]) {
      return;
    }

    this.updateState({
      config: {
        ...config,
        activeTab: tabName,
      },
    });
  }

  public onToggleShowingChange(groupId: string) {
    const config = this.currentState.config;
    if (!config) {
      return;
    }

    const newConfig = { ...config };
    newConfig.showingChange = new Set(newConfig.showingChange);
    if (!newConfig.showingToggle.has(groupId)) {
      newConfig.showingToggle = new Set(newConfig.showingToggle);
      newConfig.showingToggle.add(groupId);
    }
    if (newConfig.showingChange.has(groupId)) {
      newConfig.showingChange.delete(groupId);
    } else {
      newConfig.showingChange.add(groupId);
    }

    this.currentState = {
      ...this.currentState,
      config: newConfig,
    };

    this.callbacks.onStateChange(this.currentState);
  }

  private manageScrollTo({
    fileName,
    line,
  }: {
    fileName: string;
    line: number;
  }) {
    const config = this.currentState.config;
    if (!config || !config.files[fileName]) {
      return;
    }

    if (config.activeTab !== fileName) {
      this.onSetActiveTab(fileName);
    }

    const file = config.files[fileName];

    const relevantGroup = file.groups.find((grp) => {
      const isLineGroup = grp.type === "group";
      if (!isLineGroup) {
        return;
      }
      return grp.start <= line && line <= grp.end;
    });

    if (!relevantGroup) {
      return;
    }

    this.onToggleShowingChange((relevantGroup as LineGroup).groupId);
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
      const logs = this.currentState.logs || { records: [] };

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

      logs.records = [...logs.records, nextLog];
      this.updateState({ logs });
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
  private updateState(
    updates: DeepPartial<EngineTargetState>,
    appendArrays?: boolean
  ): void {
    if (appendArrays) {
      this.currentState = deepMergeWith(
        this.currentState,
        updates,
        (a: unknown, b: unknown) => {
          if (Array.isArray(a)) {
            if (Array.isArray(b)) {
              return [...(a as unknown[]), ...(b as unknown[])];
            }
            return [...(a as unknown[]), b];
          }
          return undefined;
        }
      );
    } else {
      this.currentState = deepMergeWith(this.currentState, updates);
    }
    this.callbacks.onStateChange(this.currentState);
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => {
      const timeout = setTimeout(resolve, ms);
      this.timeouts.push(timeout);
    });
  }
}

export function createClearState(
  simulators: SimulatorType[]
): EngineTargetState {
  const fullEmptyState: EngineTargetState = {
    [SIMULATORS.STATUS]: {
      activePods: {},
      podOrder: [],
    },
    [SIMULATORS.TERMINAL]: {
      strings: [],
    },
    [SIMULATORS.CONFIG]: {
      files: {},
      activeTab: "",
      showingToggle: new Set<string>(),
      showingChange: new Set<string>(),
    },
  };

  const emptyState: Partial<EngineTargetState> = {};

  simulators.forEach((sim) => {
    // this makes typescript happy, but makes me sad
    if (sim === SIMULATORS.STATUS) {
      emptyState[sim] = fullEmptyState[sim];
    }
    if (sim === SIMULATORS.CONFIG) {
      emptyState[sim] = fullEmptyState[sim];
    }
    if (sim === SIMULATORS.TERMINAL) {
      emptyState[sim] = fullEmptyState[sim];
    }
  });

  return emptyState;
}
