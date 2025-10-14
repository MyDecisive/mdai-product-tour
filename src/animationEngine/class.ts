import { FRAME_TYPES, SIMULATORS, STATUS } from "../utils/constants";
import { deepMergeWith } from "../utils/deepMergeWith";
import type {
  EngineFrames,
  EngineStatusTarget,
  EngineTargetState,
  EngineTerminalTarget,
  PodId,
} from "../utils/engineTypesScratch";
import type { DeepPartial, SimulatorType } from "../utils/types";
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

  async play(caller?: string) {
    console.log("play called by: ", caller);
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

  reset(caller?: string) {
    console.log("reset called ", caller);
    this.cleanup();
    this.currentState = { ...this.startState };
    this.callbacks.onStateChange(this.currentState);
    this.callbacks.onActiveSimulatorChange(null);
  }

  cleanup() {
    this.isRunning = false;
    this.timeouts.forEach(clearTimeout);
    this.timeouts = [];
  }

  private async executeAction(action: EngineFrames.Any): Promise<void> {
    if (action.type === FRAME_TYPES.delay) {
      await this.delay(action.duration);
      return;
    }

    if (action.type === FRAME_TYPES.clear) {
      this.updateState(createClearState(action.simulators));
      return;
    }

    const { simulator } = action;
    this.callbacks.onActiveSimulatorChange(simulator);

    const waitForCompletion = action.waitForComplete
      ? new Promise<void>((resolve) => {
          this.currentActionResolver = resolve;
        })
      : Promise.resolve();

    switch (action.type) {
      case FRAME_TYPES.enter_command:
        this.updateState({ [action.simulator]: action.updates }, true);
        break;
      case FRAME_TYPES.add_services:
        this.addStatusPods(action.updates);
        break;
    }

    await waitForCompletion;
  }

  private addStatusPods({
    activePods: newPods,
    podOrder: newPodOrder,
  }: EngineStatusTarget): void {
    const status = this.currentState.status || { activePods: {}, podOrder: [] };

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
      const sameNamespace = active.namespace === pod.namespace;

      const podNameDelimIdx = active.name.lastIndexOf(POD_NAME_DELIM);

      const sameService = pod.name.startsWith(
        active.name.substring(0, podNameDelimIdx)
      );
      const activeIsRunning = active.status === STATUS.running;

      return sameNamespace && sameService && activeIsRunning;
    });

    if (replacementPod) {
      // Mark the old pod for shutdown
      const status = this.currentState.status;
      status!.activePods[replacementPod.id].status = STATUS.terminating;
      this.updateState({ status });
    }
  }

  private async statusPodRemove(podId: string): Promise<void> {
    await this.delay(1000);

    const status = this.currentState.status;
    if (!status || !status.podOrder || !status.podOrder.length) {
      return;
    }

    const newPodOrder = status.podOrder.filter((id) => id !== podId);
    const newActivePods = { ...status.activePods };
    delete newActivePods[podId];

    this.updateState({
      status: {
        podOrder: newPodOrder,
        activePods: newActivePods,
      },
    });
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
    const status = this.currentState.status!;
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
      void this.statusPodRemove(podId);
    }
  }

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
  const emptyState: Record<
    SimulatorType,
    EngineTerminalTarget | EngineStatusTarget
  > = simulators.reduce((accum, simType) => {
    accum[simType] = emptyEngineStateCreators[simType]?.();
    return accum;
  }, {} as Record<SimulatorType, EngineTerminalTarget | EngineStatusTarget>);

  return emptyState as EngineTargetState;
}

const emptyEngineStateCreators = {
  [SIMULATORS.STATUS]: () => {
    return {
      activePods: {},
      podOrder: [],
    } as EngineStatusTarget;
  },
  [SIMULATORS.TERMINAL]: () => {
    return {
      strings: [],
    } as EngineTerminalTarget;
  },
};
