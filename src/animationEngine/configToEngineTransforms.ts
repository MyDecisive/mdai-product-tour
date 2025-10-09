import type {
  ConfigStatus,
  ConfigTerminalTarget,
} from "../utils/configTypesScratch";
import { STATUS } from "../utils/constants";
import type {
  ActivePodMap,
  EngineStatusTarget,
  EngineTerminalTarget,
  PodId,
} from "../utils/engineTypesScratch";
import { createTerminalContent } from "../views/Logs/terminal/behavior";

// ============================================================================
// TERMINAL SIMULATOR TRANSFORMS
// ============================================================================

export function transformTerminalConfig({
  input,
  outputs = [],
}: ConfigTerminalTarget): EngineTerminalTarget {
  return {
    strings: createTerminalContent([input]).concat(
      createTerminalContent(outputs, "terminal")
    ),
  };
}

// ============================================================================
// STATUS SIMULATOR TRANSFORMS
// ============================================================================

const ADDR_DELIM = "@";
const REPLICA_DELIM = "^";

function createPodId(svc: ConfigStatus, replicaNo: number, addr: number) {
  return `${svc.name}-${svc.namespace || "default"}-${
    svc.skipStartup || false
  }${REPLICA_DELIM}${replicaNo}${ADDR_DELIM}${addr}`;
}

export function transformStatus(
  configServices: ConfigStatus[]
): EngineStatusTarget {
  const activePods: ActivePodMap = {};
  const podOrder: PodId[] = [];

  configServices.forEach((service, serviceIdx) => {
    const replicas = service.replicas || 1;

    for (let replicaNo = 1; replicaNo <= replicas; replicaNo++) {
      const podId = createPodId(service, replicaNo, serviceIdx);

      activePods[podId] = {
        id: podId,
        name: service.name,
        namespace: service.namespace || "default",
        status: service.skipStartup ? STATUS.running : STATUS.pending,
        replicaNo,
      };

      podOrder.push(podId);
    }
  });

  return { activePods, podOrder };
}
