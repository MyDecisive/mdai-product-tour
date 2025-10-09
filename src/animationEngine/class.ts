import { ANIMATION_TYPES, STATUS } from "../utils/constants";
import { deepMergeWith } from "../utils/deepMergeWith";
import type { ActivePodMap, PodId } from "../utils/engineTypesScratch";
import type {
  AnimateStartupAnimation,
  Animations,
  DeepPartial,
  DelayAnimation,
  EngineCallbacks,
  SimulatorTargetState,
  UpdateEngineAnimation,
  UpdateServiceAnimation,
} from "../utils/types";

export class AnimationEngineInstance {
  private actions: Animations;
  private startState: SimulatorTargetState;
  private targetState: SimulatorTargetState;
  private callbacks: EngineCallbacks;

  private currentState: SimulatorTargetState;
  private isRunning = false;
  private timeouts: NodeJS.Timeout[] = [];
  private currentActionResolver: (() => void) | null = null;

  constructor(
    actions: Animations,
    startState: SimulatorTargetState,
    targetState: SimulatorTargetState,
    callbacks: EngineCallbacks
  ) {
    this.actions = actions;
    this.startState = startState;
    this.targetState = targetState;
    this.callbacks = callbacks;
    this.currentState = { ...startState };
  }

  // Called by simulator components to signal action completion
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
      // Ensure we end at exact target state
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

  private async executeAction(
    action:
      | UpdateEngineAnimation
      | DelayAnimation
      | UpdateServiceAnimation
      | AnimateStartupAnimation
  ): Promise<void> {
    // Handle delay
    if (action.type === ANIMATION_TYPES.delay) {
      await this.delay(action.duration);
      return;
    }

    // Determine which simulator this action affects
    const { simulator } = action as UpdateEngineAnimation;
    this.callbacks.onActiveSimulatorChange(simulator);

    // Create a promise that resolves when component signals completion
    const waitForCompletion = action.waitForComplete
      ? new Promise<void>((resolve) => {
          this.currentActionResolver = resolve;
        })
      : Promise.resolve();

    // Execute the action (updates state immediately)
    switch (action.type) {
      case ANIMATION_TYPES.clear:
      case ANIMATION_TYPES.pause:
      case ANIMATION_TYPES.resume:
      case ANIMATION_TYPES.update:
      case ANIMATION_TYPES.switch_file:
      case ANIMATION_TYPES.scroll_to:
      case ANIMATION_TYPES.highlight_lines:
      case ANIMATION_TYPES.toggle_line:
        this.updateState(action.updates);
        break;
      case ANIMATION_TYPES.type:
      case ANIMATION_TYPES.enter_command:
      case ANIMATION_TYPES.stream:
        this.updateState(action.updates, true);
        break;
      case ANIMATION_TYPES.add_services:
        this.addStatusServices(action);
        break;
      case ANIMATION_TYPES.animate_startup:
        void this.statusAnimateStartup(action);
        break;
    }

    // Wait for component to signal completion if requested
    await waitForCompletion;
  }

  private statusAddServices(newPods: ActivePodMap, newPodOrder: PodId[]): void {
    const status = this.currentState.status || { activePods: {}, podOrder: [] };

    // Find replacement relationships
    newPodOrder.forEach((newPodId) => {
      const newPod = newPods[newPodId];

      // Find existing pod that matches name, namespace, replicaNo
      const replacedPodId = Object.keys(status.activePods).find(
        (existingId) => {
          const existing = status.activePods[existingId];
          return (
            existing.name === newPod.name &&
            existing.namespace === newPod.namespace &&
            existing.replicaNo === newPod.replicaNo &&
            !existing.beingReplaced // Don't replace already-replaced pods
          );
        }
      );

      if (replacedPodId) {
        newPods[newPodId].replacingPodId = replacedPodId;
      }
    });

    // Merge new and existing
    this.updateState({
      status: {
        activePods: { ...status.activePods, ...newPods },
        podOrder: [...status.podOrder, ...newPodOrder],
      },
    });
  }

  private statusPodReachedRunning(podId: PodId): void {
    const pod = this.currentState.status.activePods[podId];

    if (pod.replacingPodId) {
      // Mark the old pod for shutdown
      const status = this.currentState.status;
      status.activePods[pod.replacingPodId].beingReplaced = true;
      this.updateState({ status });
    }
  }

  private async statusAnimateStartup({
    updates: { serviceName },
  }: AnimateStartupAnimation): Promise<void> {
    const status = this.currentState.status || { services: [] };
    const service = status.services.find((s) => s.name === serviceName);

    if (service && !service.skipStartup) {
      for (const state of [
        STATUS.pending,
        STATUS.containerCreating,
        STATUS.running,
      ] as const) {
        status.services = status.services.map((s) =>
          s.name === serviceName ? { ...s, status: state } : s
        );
        this.updateState({ status: { ...status } });
        await this.delay(800);
      }
    }
  }

  private updateState(
    updates: DeepPartial<SimulatorTargetState>,
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
