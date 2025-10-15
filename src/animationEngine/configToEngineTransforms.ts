import {
  createChangeMap,
  extractRelevantSections,
  rawLinesFromText,
} from "../hooks/useGetConfigSimulatorContent/utils";
import type {
  SubstepConfig,
  TourConfigSimTarget,
  TourFrames,
  TourStatusTarget,
  TourTargetState,
  TourTerminalTarget,
} from "../utils/configTypesScratch";
import { FRAME_TYPES, STATUS } from "../utils/constants";
import type {
  ActivePodMap,
  ConfigContent,
  ConfigLine,
  EngineConfigTarget,
  EngineFileConfig,
  EngineFrames,
  EngineStatusTarget,
  EngineTargetState,
  EngineTerminalTarget,
  PodId,
} from "../utils/engineTypesScratch";
import { fetchGitHubFile } from "../utils/fetchRawGithubFile";
import { createTerminalContent } from "../views/Logs/terminal/behavior";

// ============================================================================
// TERMINAL SIMULATOR TRANSFORMS
// ============================================================================

function transformTerminal(
  terminalTargets: TourTerminalTarget[]
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

function createServiceKey(svc: TourStatusTarget, ctxId: string) {
  return `${svc.name}-${svc.namespace || "default"}${REPLICA_DELIM}${
    svc.replicas || 1
  }${CTXID_DELIM}${ctxId}`;
}

function createPodId(svc: TourStatusTarget, replicaNo: number, ctxId: string) {
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

function createPodName(service: TourStatusTarget): string {
  return service.noSuffix
    ? service.name
    : `${service.name}${POD_NAME_DELIM}${createServiceNameSuffix()}`;
}

function transformStatus(
  configServices: TourStatusTarget[],
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
// CONFIG SIMULATOR TRANSFORMS
// ============================================================================

async function transformConfig(
  configSimTarget: TourConfigSimTarget
): Promise<EngineConfigTarget> {
  const fileEntries = await Promise.all(
    configSimTarget.files.map(async ({ fileName, url, changes = [] }) => {
      const name = fileName ?? url.split("/").at(-1) ?? "unknown";

      const fileContents = await fetchGitHubFile(url);
      const rawLines = rawLinesFromText(fileContents);

      const changeMap = createChangeMap(changes);
      const sections = extractRelevantSections(rawLines, changes);

      const groups: ConfigContent[] = [];

      sections.forEach((section) => {
        if (section.isGap) {
          groups.push({
            lineNo: section.startLineNo,
            isGap: true,
          });
        } else {
          const lines: ConfigLine[] = section.lines.map((line, i) => {
            const lineNo = section.startLineNo + i;
            const newContent = changeMap.get(lineNo);

            return {
              lineNo,
              content: line,
              ...(newContent && {
                newLineNo: lineNo,
                newContent,
              }),
            };
          });

          const start = section.startLineNo;
          const end = start + section.lines.length - 1;
          const isChangeBlock = lines.some((l) => l.newContent !== undefined);

          groups.push({
            groupId: `${name}-${start}-${end}`,
            start,
            end,
            lines,
            isChangeBlock,
          });
        }
      });

      const engConf: EngineFileConfig = {
        url,
        changeMap,
        showToggleButtons: changeMap.size > 0,
        groups,
      };

      return [name, engConf] as const;
    })
  );

  const files = Object.fromEntries(fileEntries);
  const activeTab =
    configSimTarget.activeTab ??
    configSimTarget.files[0]?.fileName ??
    configSimTarget.files[0]?.url.split("/").at(-1) ??
    "";

  return {
    files,
    activeTab,
  };
}

// ============================================================================
// TRANSFORMS FOR ANIMATION
// ============================================================================

function transformTourToEngineAnimation(
  animation: TourFrames.Any[],
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
// TRANSFORMS FOR STATE
// ============================================================================

async function transformTourToEngineState(
  tour: TourTargetState,
  contextId: string
): Promise<EngineTargetState> {
  return {
    terminal: tour.terminal ? transformTerminal(tour.terminal) : undefined,
    status: tour.status
      ? transformStatus(tour.status, contextId, true)
      : undefined,
    config: tour.config ? await transformConfig(tour.config) : undefined,
  };
}

// ============================================================================
// TRANSFORMS THE CONFIG STEP
// ============================================================================

export async function transformSubstepConfigToInstanceArgs(
  substep: SubstepConfig
): Promise<{
  targetState: EngineTargetState;
  frames: EngineFrames.Any[];
}> {
  const targetState = await transformTourToEngineState(
    substep.targetState,
    substep.id
  );
  const frames = transformTourToEngineAnimation(
    substep.animation || [],
    substep.id
  );

  return {
    targetState,
    frames,
  };
}
