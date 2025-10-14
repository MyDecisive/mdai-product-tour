import type {
  ConfigFrames,
  ConfigStatus,
  ConfigTargetState,
  ConfigTerminalTarget,
  SubstepConfig,
} from "../utils/configTypesScratch";
import { FRAME_TYPES, STATUS } from "../utils/constants";
import type {
  ActivePodMap,
  EngineFrames,
  EngineStatusTarget,
  EngineTargetState,
  EngineTerminalTarget,
  PodId,
} from "../utils/engineTypesScratch";
import { createTerminalContent } from "../views/Logs/terminal/behavior";

// ============================================================================
// TRANSFORMS FOR STATE
// ============================================================================

function transformConfigToEngineState(
  config: ConfigTargetState,
  contextId: string
): EngineTargetState {
  return {
    terminal: config.terminal ? transformTerminal(config.terminal) : undefined,
    status: config.status
      ? transformStatus(config.status, contextId, true)
      : undefined,
  };
}

// ============================================================================
// TERMINAL SIMULATOR TRANSFORMS
// ============================================================================

function transformTerminal(
  terminalTargets: ConfigTerminalTarget[]
): EngineTerminalTarget {
  const strings = terminalTargets.flatMap(({ input, outputs = [] }) =>
    createTerminalContent([input]).concat(
      createTerminalContent(outputs, "terminal")
    )
  );

  strings.push(createTerminalContent([""])[0]);
  return {
    strings,
  };
}

// ============================================================================
// STATUS SIMULATOR TRANSFORMS
// ============================================================================

const CTXID_DELIM = "@";
const REPLICA_DELIM = "^";

function createServiceKey(svc: ConfigStatus, ctxId: string) {
  return `${svc.name}-${svc.namespace || "default"}${REPLICA_DELIM}${
    svc.replicas || 1
  }${CTXID_DELIM}${ctxId}`;
}

function createPodId(svc: ConfigStatus, replicaNo: number, ctxId: string) {
  return `${svc.name}-${svc.namespace}${REPLICA_DELIM}${replicaNo}${CTXID_DELIM}${ctxId}`;
}

const SUFFIX_LENGTH = 5;

function createServiceNameSuffix() {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";

  return Array.from(
    { length: SUFFIX_LENGTH },
    () => chars[Math.floor(Math.random() * chars.length)]
  ).join("");
}

export const POD_NAME_DELIM = "-";

function createPodName(service: ConfigStatus): string {
  return service.noSuffix
    ? service.name
    : `${service.name}${POD_NAME_DELIM}${createServiceNameSuffix()}`;
}

function transformStatus(
  configServices: ConfigStatus[],
  contextId: string,
  isStateTransform?: boolean
): EngineStatusTarget {
  const activePods: ActivePodMap = {};
  const podOrder: PodId[] = [];

  configServices.forEach((service) => {
    const replicas = service.replicas || 1;
    service.namespace = service.namespace || "default";

    const serviceKey = createServiceKey(service, contextId);

    for (let replicaNo = 1; replicaNo <= replicas; replicaNo++) {
      const podId = createPodId(service, replicaNo, contextId);

      activePods[podId] = {
        id: podId,
        name: createPodName(service),
        namespace: service.namespace,
        status: isStateTransform ? STATUS.running : STATUS.pending,
        parentServiceKey: serviceKey,
        replicaNo,
        restartCount: 0,
      };

      podOrder.push(podId);
    }
  });

  return { activePods, podOrder };
}

// ============================================================================
// TRANSFORMS FOR ANIMATION
// ============================================================================

function transformConfigToEngineAnimation(
  animation: ConfigFrames.Any[],
  contextId: string
): EngineFrames.Any[] {
  return animation.map((frame) => {
    if (frame.waitForComplete === undefined) {
      frame.waitForComplete = true;
    }
    switch (frame.type) {
      case FRAME_TYPES.add_services:
        return {
          ...frame,
          updates: transformStatus(frame.updates, contextId),
        };
      case FRAME_TYPES.enter_command:
        return {
          ...frame,
          updates: transformTerminal(frame.updates),
        };
      default:
        return frame;
    }
  });
}

// ============================================================================
// TRANSFORMS THE CONFIG STEP
// ============================================================================

export function transformSubstepConfigToInstanceArgs(substep: SubstepConfig): {
  targetState: EngineTargetState;
  frames: EngineFrames.Any[];
} {
  const targetState = transformConfigToEngineState(
    substep.targetState,
    substep.id
  );
  const frames = transformConfigToEngineAnimation(
    substep.animation || [],
    substep.id
  );

  return {
    targetState,
    frames,
  };
}
