import type { AnyFrame, SimulatorFrameConfigs } from "../types/frames";
import type {
  ActivePodMap,
  EngineFileConfig,
  EngineLogsContext,
  EngineStatusTarget,
  EngineTargetState,
  LineGroup,
  LogRecord,
  PodId,
} from "../types/player";
import type {
  EngineContentBlock,
  EngineContentItem,
  EngineSubStep,
} from "../types/steps";
import type {
  SubStepConfig,
  AnyFrame as TourAnyFrame,
  TourConfigSimTarget,
  TourContentItem,
  TourLogsSimTarget,
  TourStatusTarget,
  TourTargetState,
  TourTerminalTarget,
} from "../types/tour";
import {
  DEFAULT_ANIMATION_STEP_DURATION,
  FRAME_TYPES,
  POD_NAME_DELIM,
  SIMULATORS,
  STATUS,
} from "./constants";
import { fetchGitHubFile } from "./fetchRawGithubFile";
import {
  addConfigTarget,
  addOrReplaceLogsContext,
  addStatusPods,
  addTerminalStrings,
  combineTargetStates,
  scrollToConfigLine,
  setLogsActiveContext,
  updateBannerState,
} from "./frameStateMergeStrategies";
import { getLogFile } from "./getAssets";
import {
  braidLogs,
  createChangeMap,
  createConfigContentGroups,
  createEmptyLogs,
  createLogRecord,
  createTerminalContent,
  extractRelevantSections,
  findReplacementPod,
  parseRawLogFileToLogLines,
  rawLinesFromText,
} from "./transformHelpers";

// ============================================================================
// TERMINAL SIMULATOR TRANSFORMS
// ============================================================================

function transformTerminal(
  terminalTargets: TourTerminalTarget[],
  printed: boolean
): NonNullable<EngineTargetState["terminal"]> {
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
): Promise<NonNullable<EngineTargetState["config"]>> {
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
    pulsedGroups: new Set<string>(),
    showingChange,
  };
}

// ============================================================================
// LOGS SIMULATOR TRANSFORMS
// ============================================================================

function loadLogsTextFile(fileName: string): LogRecord[] {
  const text = getLogFile(fileName);
  return parseRawLogFileToLogLines(text);
}

function transformLogsRecords(
  {
    logsSources = [],
    speed,
    duration,
    contextName,
  }: TourLogsSimTarget & { duration?: number },
  prepLogRecordsForState?: boolean
): EngineLogsContext & { duration: number } {
  const engineSpeed = speed ?? 1000;

  const logRecordsByFile = logsSources.map(loadLogsTextFile);

  const records = braidLogs(...logRecordsByFile);

  const returnObj: Omit<ReturnType<typeof transformLogsRecords>, "records"> = {
    speed: engineSpeed,
    duration: duration ?? DEFAULT_ANIMATION_STEP_DURATION,
    contextName,
  };

  if (prepLogRecordsForState) {
    return {
      records: records.map((log, index) =>
        createLogRecord(log, -1, index, false)
      ),
      ...returnObj,
    };
  }

  return {
    records,
    ...returnObj,
  };
}

function transformLogs(
  tourLogs: (TourLogsSimTarget & { duration?: number })[],
  prepLogRecordsForState?: boolean
): NonNullable<EngineTargetState["logs"]> {
  return tourLogs.reduce((accum, curr) => {
    if (!curr.contextName) {
      return accum;
    }
    const transformed = transformLogsRecords(curr, prepLogRecordsForState);

    accum.activeContext = transformed.contextName;

    accum.allContexts[transformed.contextName] = transformed;

    return accum;
  }, createEmptyLogs());
}

// ============================================================================
// TRANSFORMS FOR ANIMATION
// ============================================================================

async function transformTourToEngineAnimation(
  animation: TourAnyFrame[],
  contextId: string
): Promise<AnyFrame[]> {
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
              updates: transformLogsRecords(frame.updates, true),
            };
          }
          return frame;
        case FRAME_TYPES.STREAM:
          return {
            ...frame,
            updates: transformLogsRecords(frame.updates),
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
  updates: EngineLogsContext & { duration: number }
): EngineTargetState {
  const stateReadyLogsRecords = updates.records
    .slice(0, Math.max(Math.ceil(updates.duration / updates.speed), 60))
    .map((log, index) => createLogRecord(log, -1, index, false));

  const updatedAllContextsState = addOrReplaceLogsContext(state, {
    ...updates,
    records: stateReadyLogsRecords,
  });

  return setLogsActiveContext(updatedAllContextsState, updates.contextName);
}

export type StateBuilder<
  SimName extends keyof SimulatorFrameConfigs,
  FType extends keyof SimulatorFrameConfigs[SimName]
> = (
  state: EngineTargetState,
  updates: SimulatorFrameConfigs[SimName][FType]
) => EngineTargetState;

export type SimulatorStateBuilderMap = {
  [SimName in keyof SimulatorFrameConfigs]: {
    [FType in keyof SimulatorFrameConfigs[SimName]]?: StateBuilder<
      SimName,
      FType
    >;
  };
};

const stateBuilders: SimulatorStateBuilderMap = {
  [SIMULATORS.TERMINAL]: {
    [FRAME_TYPES.ENTER_COMMAND]: (state, updates) => {
      const updatesPrinted = {
        strings: updates.strings.map((str) => ({ ...str, printed: true })),
      };
      return addTerminalStrings(state, updatesPrinted);
    },
  },
  [SIMULATORS.STATUS]: {
    [FRAME_TYPES.ADD_SERVICES]: (state, updates) => {
      const targetStateUpdates = Object.entries(updates.activePods).reduce(
        (accum, [key, value]) => {
          const replacementPod = findReplacementPod(
            value,
            state.status?.activePods || {}
          );
          if (replacementPod) {
            return accum;
          }

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
        podOrder: updates.podOrder.filter(
          (podId) => !!targetStateUpdates[podId]
        ),
      });
    },
  },
  [SIMULATORS.CONFIG]: {
    [FRAME_TYPES.ADD]: (state, updates) => {
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
  },
  [SIMULATORS.BANNER]: {
    [FRAME_TYPES.UPDATE]: updateBannerState,
  },
};

function buildTargetStateFromEngineAnimation(
  frames: AnyFrame[],
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
      const clearedState = { ...state };
      frame.simulators.forEach((sim) => {
        clearedState[sim] = undefined;
      });
      return clearedState;
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
    logs: tour.logs ? transformLogs(tour.logs, true) : undefined,
    banner: tour.banner,
  };
}

// ============================================================================
// TRANSFORMS THE CONFIG STEP
// ============================================================================
export async function transformSubStepConfigToInstanceArgs(
  { initialState, id, animation, content }: SubStepConfig,
  previousTargetState: EngineTargetState | undefined
): Promise<
  Pick<EngineSubStep, "initialState" | "targetState" | "animation" | "content">
> {
  const returnVal: Partial<
    Pick<
      EngineSubStep,
      "initialState" | "targetState" | "animation" | "content"
    >
  > = {
    initialState: { ...previousTargetState },
  };

  if (initialState) {
    const transformedInitial = await transformTourToEngineState(
      initialState,
      id
    );
    returnVal.initialState = combineTargetStates(
      returnVal.initialState || {},
      transformedInitial
    );
  }

  if (animation && animation.length > 0) {
    const frames = await transformTourToEngineAnimation(animation || [], id);

    const targetState = buildTargetStateFromEngineAnimation(
      frames,
      returnVal.initialState
    );

    returnVal.animation = frames;
    returnVal.targetState = targetState;
  }

  if (content && content.length) {
    if (
      content.some(({ items = [] }) =>
        items.some((item) => !("src" in item) && (item.actions || item.onClick))
      )
    ) {
      const updatedContent = await Promise.all(
        content.map(async (c) => {
          if (c.items && c.items.length) {
            const transformedItems = await Promise.all(
              c.items?.map(async (item) => {
                const returnItem =
                  await transformContentItemToEngineContentItem(item, id);

                return returnItem;
              })
            );

            return {
              ...c,
              items: transformedItems,
            };
          }
          return {
            ...c,
          } as EngineContentBlock;
        })
      );

      returnVal.content = updatedContent;
    } else {
      returnVal.content = [...content] as EngineContentBlock[];
    }
  }

  return returnVal as Pick<
    EngineSubStep,
    "initialState" | "targetState" | "animation" | "content"
  >;
}

async function transformContentItemToEngineContentItem(
  content: TourContentItem,
  contextId: string
): Promise<EngineContentItem> {
  const { onClick, actions, ...rest } = content;

  let transformedOnClick: AnyFrame | undefined;
  let transformedActions: AnyFrame[] | undefined;

  if (onClick) {
    const [result] = await transformTourToEngineAnimation([onClick], contextId);
    transformedOnClick = result;
  }

  if (actions) {
    transformedActions = await transformTourToEngineAnimation(
      actions,
      contextId
    );
  }

  const result: EngineContentItem = {
    ...rest,
    ...(transformedOnClick && { onClick: transformedOnClick }),
    ...(transformedActions && { actions: transformedActions }),
  };

  return result;
}
