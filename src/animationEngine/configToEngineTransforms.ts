import type {
  ConfigFrames,
  ConfigStatus,
  ConfigTargetState,
  ConfigTerminalTarget,
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

export function transformConfigToEngineState(
  config: ConfigTargetState
): EngineTargetState {
  return {
    terminal: config.terminal ? transformTerminal(config.terminal) : undefined,
    status: config.status ? transformStatus(config.status, true) : undefined,
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
  return {
    strings,
  };
}

// ============================================================================
// STATUS SIMULATOR TRANSFORMS
// ============================================================================

const ADDR_DELIM = "@";
const REPLICA_DELIM = "^";

function createServiceKey(svc: ConfigStatus, addr: number) {
  return `${svc.name}-${svc.namespace || "default"}${REPLICA_DELIM}${
    svc.replicas || 1
  }${ADDR_DELIM}${addr}`;
}

function createPodId(svc: ConfigStatus, replicaNo: number, addr: number) {
  return `${svc.name}-${svc.namespace}${REPLICA_DELIM}${replicaNo}${ADDR_DELIM}${addr}`;
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
  isStateTransform?: boolean
): EngineStatusTarget {
  const activePods: ActivePodMap = {};
  const podOrder: PodId[] = [];

  configServices.forEach((service, serviceIdx) => {
    const replicas = service.replicas || 1;
    service.namespace = service.namespace || "default";

    const serviceKey = createServiceKey(service, serviceIdx);

    for (let replicaNo = 1; replicaNo <= replicas; replicaNo++) {
      const podId = createPodId(service, replicaNo, serviceIdx);

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

export function transformConfigToEngineAnimation(
  animation: ConfigFrames.Any[]
): EngineFrames.Any[] {
  return animation.map((frame) => {
    switch (frame.type) {
      case FRAME_TYPES.add_services:
        return {
          ...frame,
          updates: transformStatus(frame.updates),
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
