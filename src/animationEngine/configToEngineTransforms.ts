import {
  createChangeMap,
  createConfigContentGroups,
  extractRelevantSections,
  rawLinesFromText,
} from "../hooks/useGetConfigSimulatorContent/utils";
import type {
  SubstepConfig,
  TourConfigSimTarget,
  TourLogSimTarget,
  TourStatusTarget,
  TourTargetState,
  TourTerminalTarget,
} from "../utils/configTypesScratch";
import { FRAME_TYPES, SIMULATORS, STATUS } from "../utils/constants";
import type {
  ActivePodMap,
  EngineConfigTarget,
  EngineFileConfig,
  EngineLogsTarget,
  EngineStatusTarget,
  EngineTargetState,
  EngineTerminalTarget,
  LineGroup,
  PodId,
} from "../utils/engineTypesScratch";
import { fetchGitHubFile } from "../utils/fetchRawGithubFile";
import type { EngineFrames, LogRecord, TourFrames } from "../utils/types";
import { braidLogs } from "../views/Logs/tailLogs/braidLogs";
import { parseRawLogFileToLogLines } from "../views/Logs/tailLogs/parseRawLogs";
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

// TODO: remove export
// exporting only to hack for local dev
export function transformStatus(
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

      const groups = createConfigContentGroups(name, sections, changeMap);

      const engConf: EngineFileConfig = {
        fileName: name,
        url,
        changeMap,
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

  const showingChange = new Set(
    fileEntries.flatMap(([, conf]) =>
      conf.groups
        .filter((g): g is LineGroup => g.type === "group" && g.isChangeBlock)
        .map((g) => g.groupId)
    )
  );

  return {
    files,
    activeTab,
    showingToggle: new Set<string>(),
    showingChange,
  };
}

// ============================================================================
// LOGS SIMULATOR TRANSFORMS
// ============================================================================

async function loadLogsTextFile(fileName: string): Promise<LogRecord[]> {
  const res = await fetch(`/logs/${fileName}`);
  if (!res.ok) {
    throw new Error(`Failed to load log file: ${fileName}`);
  }

  const text = await res.text();
  return parseRawLogFileToLogLines(text);
}

async function transformLogs({
  logsSources = [],
  speed,
  errorFrequency,
  errorLogsSource,
}: TourLogSimTarget): Promise<EngineLogsTarget> {
  const engineSpeed = speed ?? 1000;
  const engineErrorFrequency = errorFrequency ?? 0.1;

  const logRecordsByFile = await Promise.all(logsSources.map(loadLogsTextFile));

  const errorLogs = errorLogsSource
    ? await loadLogsTextFile(errorLogsSource)
    : [];

  return {
    records: braidLogs(...logRecordsByFile),
    speed: engineSpeed,
    errorFrequency: engineErrorFrequency,
    errorRecords: errorLogs,
  };
}

// ============================================================================
// TRANSFORMS FOR ANIMATION
// ============================================================================

async function transformTourToEngineAnimation(
  animation: TourFrames["Any"][],
  contextId: string
): Promise<EngineFrames["Any"][]> {
  return Promise.all(
    animation.map(async (frame) => {
      if (frame.waitForComplete === undefined) {
        frame.waitForComplete = true;
      }
      switch (frame.type) {
        case FRAME_TYPES.ADD_SERVICES:
          return {
            ...frame,
            updates: transformStatus(frame.updates, contextId),
          };
        case FRAME_TYPES.ENTER_COMMAND:
          return {
            ...frame,
            updates: transformTerminal(frame.updates),
          };
        case FRAME_TYPES.ADD:
          if (frame.simulator === SIMULATORS.CONFIG) {
            return {
              ...frame,
              updates: await transformConfig(frame.updates),
            };
          }
          if (frame.simulator === SIMULATORS.LOGS) {
            return {
              ...frame,
              updates: await transformLogs(frame.updates),
            };
          }
          return frame;
        case FRAME_TYPES.STREAM:
        case FRAME_TYPES.RESUME:
          return {
            ...frame,
            updates: await transformLogs(frame.updates),
          };
        case FRAME_TYPES.SCROLL_TO:
        case FRAME_TYPES.PAUSE:
        default:
          return frame;
      }
    })
  );
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
    logs: tour.logs ? await transformLogs(tour.logs) : undefined,
  };
}

// ============================================================================
// TRANSFORMS THE CONFIG STEP
// ============================================================================

export async function transformSubstepConfigToInstanceArgs(
  substep: SubstepConfig
): Promise<{
  targetState: EngineTargetState;
  frames: EngineFrames["Any"][];
}> {
  const targetState = await transformTourToEngineState(
    substep.targetState,
    substep.id
  );
  const frames = await transformTourToEngineAnimation(
    substep.animation || [],
    substep.id
  );

  return {
    targetState,
    frames,
  };
}
