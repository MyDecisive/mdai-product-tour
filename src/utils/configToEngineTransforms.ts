import {
  addConfigTarget,
  addLogsRecords,
  addStatusPods,
  addTerminalStrings,
  scrollToConfigLine,
  updateBannerState,
} from "../animationEngine/frameStateMergeStrategies";
import {
  braidLogs,
  createChangeMap,
  createConfigContentGroups,
  createLogRecord,
  createTerminalContent,
  extractRelevantSections,
  parseRawLogFileToLogLines,
  rawLinesFromText,
} from "../animationEngine/transformHelpers";
import type {
  SubStepConfig,
  TourConfigSimTarget,
  TourLogSimTarget,
  TourStatusTarget,
  TourTargetState,
  TourTerminalTarget,
} from "./configTypesScratch";
import {
  DEFAULT_ANIMATION_STEP_DURATION,
  FRAME_TYPES,
  SIMULATORS,
  STATUS,
} from "./constants";
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
} from "./engineTypesScratch";
import { fetchGitHubFile } from "./fetchRawGithubFile";
import type {
  EngineFrames,
  LogRecord,
  SimulatorStateBuilderMap,
  TourFrames,
} from "./types";

// ============================================================================
// TERMINAL SIMULATOR TRANSFORMS
// ============================================================================

function transformTerminal(
  terminalTargets: TourTerminalTarget[],
  printed: boolean
): EngineTerminalTarget {
  const strings = terminalTargets.flatMap(({ input, outputs = [] }) =>
    createTerminalContent([input], printed).concat(
      createTerminalContent(outputs, printed, "terminal")
    )
  );

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

    const ctxId = `${isStateTransform ? "state" : "frame"}.${contextId}`;

    const serviceKey = createServiceKey(service, ctxId);

    for (let replicaNo = 1; replicaNo <= replicas; replicaNo++) {
      const podId = createPodId(service, replicaNo, ctxId);

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
    configSimTarget.files.map(async ({ fileName, url, changes }) => {
      const name = fileName ?? url.split("/").at(-1) ?? "unknown";
      const lineChanges = changes || [];

      const fileContents = await fetchGitHubFile(url);
      const rawLines = rawLinesFromText(fileContents);

      const changeMap = createChangeMap(lineChanges);
      const sections = extractRelevantSections(rawLines, lineChanges);

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

async function transformLogs(
  {
    logsSources = [],
    speed,
    errorFrequency,
    errorLogsSource,
    duration,
  }: TourLogSimTarget & { duration?: number },
  prepLogRecordsForState?: boolean
): Promise<EngineLogsTarget & { duration: number }> {
  const engineSpeed = speed ?? 1000;
  const engineErrorFrequency = errorFrequency ?? 0.1;

  const logRecordsByFile = await Promise.all(logsSources.map(loadLogsTextFile));

  const errorLogs = errorLogsSource
    ? await loadLogsTextFile(errorLogsSource)
    : [];

  const records = braidLogs(...logRecordsByFile);

  if (prepLogRecordsForState) {
    return {
      records: records.map((log, index) =>
        createLogRecord(log, -1, index, false)
      ),
      speed: engineSpeed,
      errorFrequency: engineErrorFrequency,
      errorRecords: errorLogs,
      duration: duration ?? DEFAULT_ANIMATION_STEP_DURATION,
    };
  }

  return {
    records,
    speed: engineSpeed,
    errorFrequency: engineErrorFrequency,
    errorRecords: errorLogs,
    duration: duration ?? DEFAULT_ANIMATION_STEP_DURATION,
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
      if (
        frame.waitForComplete === undefined &&
        (!("simulator" in frame) || frame.simulator !== SIMULATORS.BANNER)
      ) {
        frame.waitForComplete = true;
      }
      switch (frame.type) {
        case FRAME_TYPES.ACTIVATE:
          return {
            ...frame,
            duration: frame.duration ?? DEFAULT_ANIMATION_STEP_DURATION,
          };
        case FRAME_TYPES.ADD_SERVICES:
          return {
            ...frame,
            updates: transformStatus(frame.updates, contextId),
          };
        case FRAME_TYPES.ENTER_COMMAND:
          return {
            ...frame,
            updates: transformTerminal(frame.updates, false),
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
// FRAMES TO TARGET STATE
// ============================================================================

function createEmptyEngineTargetState(): EngineTargetState {
  return {};
}

function addLogRecordsForState(
  state: EngineTargetState,
  updates: Pick<EngineLogsTarget, "records">
): EngineTargetState {
  const stateReadyLogsRecords = updates.records.map((log, index) =>
    createLogRecord(log, -1, index, false)
  );

  return addLogsRecords(state, { records: stateReadyLogsRecords });
}

const stateBuilders: SimulatorStateBuilderMap = {
  [SIMULATORS.TERMINAL]: {
    [FRAME_TYPES.ENTER_COMMAND]: (
      state: EngineTargetState,
      updates: EngineTerminalTarget
    ) => {
      const updatesPrinted = {
        strings: updates.strings.map((str) => ({ ...str, printed: true })),
      };
      return addTerminalStrings(state, updatesPrinted);
    },
  },
  [SIMULATORS.STATUS]: {
    [FRAME_TYPES.ADD_SERVICES]: (
      state: EngineTargetState,
      updates: EngineStatusTarget
    ) => {
      const targetStateUpdates = Object.entries(updates.activePods).reduce(
        (accum, [key, value]) => {
          accum[key] = {
            ...value,
            status: STATUS.running,
          };
          return accum;
        },
        {} as ActivePodMap
      );
      return addStatusPods(state, {
        ...updates,
        activePods: targetStateUpdates,
      });
    },
  },
  [SIMULATORS.CONFIG]: {
    [FRAME_TYPES.ADD]: (
      state: EngineTargetState,
      updates: EngineConfigTarget
    ) => {
      if (updates.showingChange.size > 0) {
        return addConfigTarget(state, {
          ...updates,
          showingToggle: updates.showingChange,
          showingChange: updates.showingToggle || new Set<string>(),
        });
      }
      return addConfigTarget(state, updates);
    },
    [FRAME_TYPES.SCROLL_TO]: scrollToConfigLine,
  },
  [SIMULATORS.LOGS]: {
    [FRAME_TYPES.ADD]: addLogRecordsForState,
    [FRAME_TYPES.STREAM]: addLogRecordsForState,
    // PAUSE doesn't update state directly
  },
  [SIMULATORS.BANNER]: {
    [FRAME_TYPES.UPDATE]: updateBannerState,
  },
};

function builtTargetStateFromEngineAnimation(
  frames: EngineFrames["Any"][],
  initialState?: EngineTargetState
): EngineTargetState {
  return frames.reduce((state, frame) => {
    if (
      frame.type === FRAME_TYPES.DELAY ||
      frame.type === FRAME_TYPES.ACTIVATE
    ) {
      return state;
    }

    if (frame.type === FRAME_TYPES.CLEAR) {
      return createEmptyEngineTargetState();
    }

    const sim = frame.simulator;

    const simBuilders = stateBuilders[sim];
    const builder = simBuilders?.[frame.type as keyof typeof simBuilders] as
      | ((state: EngineTargetState, updates: unknown) => EngineTargetState)
      | undefined;

    return builder ? builder(state, frame.updates) : state;
  }, initialState ?? createEmptyEngineTargetState());
}

// ============================================================================
// TRANSFORMS INITIAL STATE
// ============================================================================

async function transformTourToEngineState(
  tour: TourTargetState,
  contextId: string
): Promise<EngineTargetState> {
  return {
    terminal: tour.terminal
      ? transformTerminal(tour.terminal, true)
      : undefined,
    status: tour.status
      ? transformStatus(tour.status, contextId, true)
      : undefined,
    config: tour.config ? await transformConfig(tour.config) : undefined,
    logs: tour.logs ? await transformLogs(tour.logs, true) : undefined,
    banner: tour.banner,
  };
}

// ============================================================================
// TRANSFORMS THE CONFIG STEP
// ============================================================================

export async function transformSubStepConfigToInstanceArgs(
  subStep: SubStepConfig
): Promise<{
  initialState?: EngineTargetState;
  targetState?: EngineTargetState;
  animation?: EngineFrames["Any"][];
}> {
  const returnVal: {
    initialState?: EngineTargetState;
    targetState?: EngineTargetState;
    animation?: EngineFrames["Any"][];
  } = {};

  if (subStep.initialState) {
    const transformedInitial = await transformTourToEngineState(
      subStep.initialState,
      subStep.id
    );
    returnVal.initialState = transformedInitial;
  }

  if (subStep.animation && subStep.animation.length > 0) {
    const frames = await transformTourToEngineAnimation(
      subStep.animation || [],
      subStep.id
    );

    const targetState = builtTargetStateFromEngineAnimation(
      frames,
      returnVal.initialState
    );

    returnVal.animation = frames;
    returnVal.targetState = targetState;
  }

  return returnVal;
}
