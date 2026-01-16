import type { PodStatus } from "../types/kinds";
import type {
  ActivePod,
  ActivePods,
  ActiveScrollTarget,
  ConfigFile,
  LineGroup,
  LogsContext,
  Player,
  PodId,
} from "../types/player";
import { SIMULATORS, STATUS } from "../utils/constants";
import { findReplacementPod } from "./transformHelpers";

// ============================================================================
// TYPE-SAFE STATE TRANSFORMATION FUNCTIONS
// ============================================================================

function updateAt<K extends keyof Player, T = unknown>(
  currentState: Player,
  simulator: K,
  path: string[],
  updater: (current: unknown) => T
): Player {
  if (path.length === 0) {
    throw new Error("Path cannot be empty");
  }

  const current = currentState[simulator];

  const updateNested = (obj: unknown, pathIndex: number): unknown => {
    if (pathIndex >= path.length) {
      return updater(obj);
    }

    const key = path[pathIndex];

    // Validate that we can traverse this path
    if (obj !== undefined && obj !== null && typeof obj !== "object") {
      throw new Error(
        `Cannot traverse path ${path.slice(0, pathIndex + 1).join(".")}: ` +
          `expected object but got ${typeof obj}`
      );
    }

    const currentObj = (obj || {}) as Record<string, unknown>;

    return {
      ...currentObj,
      [key]: updateNested(currentObj[key], pathIndex + 1),
    };
  };

  return {
    ...currentState,
    [simulator]: updateNested(current, 0),
  };
}

function appendAt<K extends keyof Player>(
  currentState: Player,
  simulator: K,
  path: string[],
  items: unknown[]
): Player {
  return updateAt(currentState, simulator, path, (current) => {
    if (current !== undefined && !Array.isArray(current)) {
      throw new Error(
        `Cannot append to path ${path.join(".")}: ` +
          `expected array but got ${typeof current} (${JSON.stringify(
            current
          ).slice(0, 50)})`
      );
    }

    if (!Array.isArray(items)) {
      throw new Error(
        `Cannot append non-array items to path ${path.join(".")}: ` +
          `got ${typeof items}`
      );
    }

    const arr = (Array.isArray(current) ? current : []) as unknown[];
    return [...arr, ...items];
  });
}
// TODO: once unit tests have been written for this file, convert to these less specific helper functions
// function setAt<K extends keyof EngineTargetState>(
//   currentState: EngineTargetState,
//   simulator: K,
//   path: string[],
//   value: unknown
// ): EngineTargetState {
//   return updateAt(currentState, simulator, path, () => value);
// }

// function mergeAt<K extends keyof EngineTargetState>(
//   currentState: EngineTargetState,
//   simulator: K,
//   path: string[],
//   updates: Record<string, unknown>
// ): EngineTargetState {
//   return updateAt(currentState, simulator, path, (current) => {
//     if (
//       current !== undefined &&
//       (typeof current !== "object" || Array.isArray(current))
//     ) {
//       throw new Error(
//         `Cannot merge at path ${path.join(".")}: ` +
//           `expected object but got ${
//             Array.isArray(current) ? "array" : typeof current
//           }`
//       );
//     }

//     if (
//       typeof updates !== "object" ||
//       updates === null ||
//       Array.isArray(updates)
//     ) {
//       throw new Error(
//         `Cannot merge non-object updates at path ${path.join(".")}: ` +
//           `got ${Array.isArray(updates) ? "array" : typeof updates}`
//       );
//     }

//     return {
//       ...((current as Record<string, unknown>) || {}),
//       ...updates,
//     };
//   });
// }

// function removeFromArrayAt<K extends keyof EngineTargetState>(
//   currentState: EngineTargetState,
//   simulator: K,
//   path: string[],
//   predicate: (item: unknown) => boolean
// ): EngineTargetState {
//   return updateAt<K, unknown[]>(
//     currentState,
//     simulator,
//     path,
//     (current) => {
//       if (!Array.isArray(current)) {
//         throw new Error(
//           `Cannot filter path ${path.join(".")}: ` +
//             `expected array but got ${typeof current}`
//         );
//       }

//       if (typeof predicate !== "function") {
//         throw new Error(
//           `Cannot filter array at path ${path.join(".")}: ` +
//             `predicate must be a function`
//         );
//       }

//       return current.filter(predicate);
//     }
//   );
// }

// function deleteKeysAt<K extends keyof EngineTargetState>(
//   currentState: EngineTargetState,
//   simulator: K,
//   path: string[],
//   keys: string[]
// ): EngineTargetState {
//   return updateAt(currentState, simulator, path, (current) => {
//     if (
//       typeof current !== "object" ||
//       current === null ||
//       Array.isArray(current)
//     ) {
//       throw new Error(
//         `Cannot delete keys at path ${path.join(".")}: ` +
//           `expected object but got ${
//             Array.isArray(current) ? "array" : typeof current
//           }`
//       );
//     }

//     if (!Array.isArray(keys)) {
//       throw new Error(
//         `Cannot delete keys at path ${path.join(".")}: ` +
//           `keys must be an array`
//       );
//     }

//     const obj = { ...(current as Record<string, unknown>) };
//     keys.forEach((key) => delete obj[key]);
//     return obj;
//   });
// }

// function toggleInSetAt<K extends keyof EngineTargetState>(
//   currentState: EngineTargetState,
//   simulator: K,
//   path: string[],
//   value: unknown
// ): EngineTargetState {
//   return updateAt(currentState, simulator, path, (current) => {
//     if (current !== undefined && !(current instanceof Set)) {
//       throw new Error(
//         `Cannot toggle in path ${path.join(".")}: ` +
//           `expected Set but got ${current?.constructor?.name || typeof current}`
//       );
//     }

//     const set = new Set(current as Set<unknown>);
//     if (set.has(value)) {
//       set.delete(value);
//     } else {
//       set.add(value);
//     }
//     return set;
//   });
// }

// Generic merge for simple cases
export function mergeIntoSimulator<
  K extends keyof Player,
  S extends NonNullable<Player[K]>
>(currentState: Player, simulator: K, updates: Partial<S>): Player {
  const current = currentState[simulator];
  return {
    ...currentState,
    [simulator]: { ...current, ...updates } as S,
  };
}

// Merge objects (for activePods, files, etc.)
export function mergeObjects<
  K extends keyof Player,
  S extends NonNullable<Player[K]>,
  ObjKey extends keyof S
>(
  currentState: Player,
  simulator: K,
  objectKey: ObjKey,
  updates: S[ObjKey] extends Record<string, infer V> ? Record<string, V> : never
): Player {
  const current = currentState[simulator] as S | undefined;
  const currentObj = (current?.[objectKey] || {}) as Record<string, unknown>;

  return {
    ...currentState,
    [simulator]: {
      ...current,
      [objectKey]: { ...currentObj, ...updates },
    } as S,
  };
}

export function appendToArray<
  K extends keyof Player,
  S extends NonNullable<Player[K]>,
  ArrKey extends keyof S
>(
  currentState: Player,
  simulator: K,
  arrayKey: ArrKey,
  items: S[ArrKey] extends Array<infer T> ? T[] : never
): Player {
  const current = currentState[simulator] as S | undefined;
  const currentArr = (current?.[arrayKey] || []) as unknown[];

  return {
    ...currentState,
    [simulator]: {
      ...current,
      [arrayKey]: [...currentArr, ...items],
    } as S,
  };
}

// Update nested property in object
export function updateInObject<
  K extends keyof Player,
  S extends NonNullable<Player[K]>,
  ObjKey extends keyof S,
  ItemKey extends keyof NonNullable<S[ObjKey]>
>(
  currentState: Player,
  simulator: K,
  objectKey: ObjKey,
  itemKey: ItemKey,
  updates: Partial<NonNullable<S[ObjKey]>[ItemKey]>
): Player {
  const current = currentState[simulator] as S | undefined;
  const currentObj = current?.[objectKey] as
    | Record<string | number | symbol, unknown>
    | undefined;

  if (!currentObj) {
    return currentState; // Can't update if object doesn't exist
  }

  const currentItem = currentObj[itemKey] as
    | NonNullable<S[ObjKey]>[ItemKey]
    | undefined;

  return {
    ...currentState,
    [simulator]: {
      ...current,
      [objectKey]: {
        ...currentObj,
        [itemKey]: {
          ...(currentItem || ({} as object)),
          ...updates,
        } as NonNullable<S[ObjKey]>[ItemKey],
      },
    } as S,
  };
}

// Toggle Set membership
export function toggleInSet<
  K extends keyof Player,
  S extends NonNullable<Player[K]>,
  SetKey extends keyof S
>(
  currentState: Player,
  simulator: K,
  setKey: SetKey,
  value: S[SetKey] extends Set<infer T> ? T : never
): Player {
  const current = currentState[simulator] as S | undefined;
  const currentSet = (current?.[setKey] || new Set()) as Set<unknown>;
  const newSet = new Set(currentSet);

  if (newSet.has(value)) {
    newSet.delete(value);
  } else {
    newSet.add(value);
  }

  return {
    ...currentState,
    [simulator]: {
      ...current,
      [setKey]: newSet,
    } as S,
  };
}

function unionSets<T>(a?: Set<T>, b?: Set<T>): Set<T> {
  const result = new Set<T>(a ? Array.from(a) : []);
  if (b) {
    for (const v of b) result.add(v);
  }
  return result;
}

// Remove from array by predicate
export function removeFromArray<
  K extends keyof Player,
  S extends NonNullable<Player[K]>,
  ArrKey extends keyof S
>(
  currentState: Player,
  simulator: K,
  arrayKey: ArrKey,
  predicate: (item: S[ArrKey] extends Array<infer T> ? T : never) => boolean
): Player {
  const current = currentState[simulator] as S | undefined;
  const currentArr = (current?.[arrayKey] || []) as Array<
    S[ArrKey] extends Array<infer T> ? T : never
  >;

  return {
    ...currentState,
    [simulator]: {
      ...current,
      [arrayKey]: currentArr.filter(predicate),
    } as S,
  };
}

// Remove keys from object
export function removeFromObject<
  K extends keyof Player,
  S extends NonNullable<Player[K]>,
  ObjKey extends keyof S
>(
  currentState: Player,
  simulator: K,
  objectKey: ObjKey,
  keysToRemove: (keyof NonNullable<S[ObjKey]>)[]
): Player {
  const current = currentState[simulator] as S | undefined;
  const currentObj = (current?.[objectKey] || {}) as Record<string, unknown>;
  const newObj = { ...currentObj };

  keysToRemove.forEach((key) => delete newObj[key as string]);

  return {
    ...currentState,
    [simulator]: {
      ...current,
      [objectKey]: newObj,
    } as S,
  };
}

// ============================================================================
// SPECIFIC STATE TRANSFORMATIONS (fully type-safe)
// ============================================================================

export function combineTargetStates(first: Player, second: Player): Player {
  const returnState: Player = { ...first };

  if (second.banner) {
    returnState.banner = {
      ...(returnState.banner || {}),
      ...second.banner,
    };
  }

  if (second.logs) {
    returnState.logs = {
      activeContext:
        second.logs.activeContext ?? returnState.logs?.activeContext,
      allContexts: {
        ...returnState.logs?.allContexts,
        ...second.logs.allContexts,
      },
    };
  }

  if (second.terminal) {
    returnState.terminal = {
      strings: [
        ...(returnState.terminal?.strings || []),
        ...second.terminal.strings.map((str) => ({ ...str, printed: true })),
      ],
    };
  }

  if (second.status) {
    const secondStateActivePods = Object.entries(
      second.status.activePods
    ).reduce((accum, [key, value]) => {
      // TODO: Should this even be present here? Do we _want_ to overwrite?
      const replacementPod = findReplacementPod(
        value,
        returnState.status?.activePods || {}
      );
      if (replacementPod) {
        return accum;
      }

      accum[key] = {
        ...value,
        status: STATUS.running,
      };

      return accum;
    }, {} as ActivePods);
    returnState.status = {
      activePods: {
        ...returnState.status?.activePods,
        ...secondStateActivePods,
      },
      podOrder: second.status?.podOrder.filter(
        (podId) => !!secondStateActivePods[podId]
      ),
    };
  }

  if (second.config) {
    return addConfigTarget(returnState, second.config);
  }

  return returnState;
}

/**
 * STATUS
 */
export function addStatusPods(
  currentState: Player,
  updates: NonNullable<Player["status"]>
): Player {
  let state = mergeObjects<
    "status",
    NonNullable<Player["status"]>,
    "activePods"
  >(currentState, "status", "activePods", updates.activePods);

  state = appendToArray<"status", NonNullable<Player["status"]>, "podOrder">(
    state,
    "status",
    "podOrder",
    updates.podOrder
  );

  return state;
}

export function updatePodStatus(
  currentState: Player,
  {
    podId,
    status,
    incrementRestarts,
  }: {
    podId: PodId;
    status: PodStatus;
    incrementRestarts?: boolean;
  }
): Player {
  const pod = currentState.status?.activePods[podId];
  if (!pod) return currentState;

  const updates: Partial<ActivePod> = {
    status,
    ...(incrementRestarts && { restartCount: pod.restartCount + 1 }),
  };

  return mergeObjects<"status", NonNullable<Player["status"]>, "activePods">(
    currentState,
    "status",
    "activePods",
    { [podId]: { ...pod, ...updates } }
  );
}

export function removeStatusPods(
  currentState: Player,
  podIds: Set<PodId>
): Player {
  let state = removeFromArray<
    "status",
    NonNullable<Player["status"]>,
    "podOrder"
  >(currentState, "status", "podOrder", (id) => !podIds.has(id));

  state = removeFromObject<
    "status",
    NonNullable<Player["status"]>,
    "activePods"
  >(state, "status", "activePods", Array.from(podIds));

  return state;
}

/**
 * CONFIG
 */
export function setConfigActiveTab(
  currentState: Player,
  tabName: string
): Player {
  return mergeIntoSimulator<"config", NonNullable<Player["config"]>>(
    currentState,
    "config",
    { activeTab: tabName }
  );
}

export function toggleConfigShowingChange(
  currentState: Player,
  groupId: string
): Player {
  let state = currentState;
  const config = state.config;

  if (!config?.showingToggle.has(groupId)) {
    state = toggleInSet<
      "config",
      NonNullable<Player["config"]>,
      "showingToggle"
    >(state, "config", "showingToggle", groupId);
  }

  return toggleInSet<"config", NonNullable<Player["config"]>, "showingChange">(
    state,
    "config",
    "showingChange",
    groupId
  );
}

export function toggleConfigPulseGroup(
  currentState: Player,
  groupId: string
): Player {
  return toggleInSet<"config", NonNullable<Player["config"]>, "pulsedGroups">(
    currentState,
    "config",
    "pulsedGroups",
    groupId
  );
}

function mergeConfigSets(
  currentState: Player,
  incomingSets: Partial<
    Pick<
      NonNullable<Player["config"]>,
      "showingToggle" | "showingChange" | "pulsedGroups"
    >
  >
): Player {
  const currentConfig = currentState.config;
  if (!currentConfig) {
    // No config yet; if incoming sets provided, create a new config skeleton
    const newConfig: NonNullable<Player["config"]> = {
      files: {},
      activeTab: "",
      showingToggle: incomingSets.showingToggle
        ? new Set(incomingSets.showingToggle)
        : new Set(),
      showingChange: incomingSets.showingChange
        ? new Set(incomingSets.showingChange)
        : new Set(),
      pulsedGroups: new Set(),
    };

    return mergeIntoSimulator<"config", NonNullable<Player["config"]>>(
      currentState,
      "config",
      newConfig
    );
  }

  const combinedToggle = unionSets(
    currentConfig.showingToggle,
    incomingSets.showingToggle
  );
  const combinedChange = unionSets(
    currentConfig.showingChange,
    incomingSets.showingChange
  );
  const combinedPulse = unionSets(
    currentConfig.pulsedGroups,
    incomingSets.pulsedGroups
  );

  return mergeIntoSimulator<"config", NonNullable<Player["config"]>>(
    currentState,
    "config",
    {
      showingToggle: combinedToggle,
      showingChange: combinedChange,
      pulsedGroups: combinedPulse,
    }
  );
}

function addOrReplaceConfigFile(
  currentState: Player,
  files: Record<string, ConfigFile>
): Player {
  return mergeObjects<"config", NonNullable<Player["config"]>, "files">(
    currentState,
    "config",
    "files",
    files
  );
}

export function addConfigTarget(
  currentState: Player,
  update: NonNullable<Player["config"]>
): Player {
  const { files, showingChange, showingToggle, activeTab, pulsedGroups } =
    update;
  let state = addOrReplaceConfigFile(currentState, files);

  if (showingToggle || showingChange) {
    state = mergeConfigSets(state, {
      showingChange,
      showingToggle,
      pulsedGroups,
    });
  }

  if (activeTab) {
    state = mergeIntoSimulator(state, "config", {
      activeTab,
    });
  }

  return state;
}

export function setConfigScrollTarget(
  currentState: Player,
  activeScrollTarget: ActiveScrollTarget | undefined
): Player {
  return mergeIntoSimulator<"config", NonNullable<Player["config"]>>(
    currentState,
    "config",
    { activeScrollTarget }
  );
}

export function scrollToConfigLine(
  currentState: Player,
  {
    fileName,
    line,
  }: {
    fileName: string;
    line: number;
  }
): Player {
  const config = currentState.config;
  if (!config || !config.files[fileName]) {
    return currentState;
  }

  const file = config.files[fileName];

  const lineGroup =
    (file.groups.find((grp) => {
      const isLineGroup = grp.type === "group";
      if (!isLineGroup) {
        return;
      }
      return grp.start <= line && line <= grp.end;
    }) as LineGroup) || ({} as LineGroup);

  if (!lineGroup?.groupId) {
    return currentState;
  }

  const stateWithUpdatedActiveTab = setConfigActiveTab(currentState, fileName);

  return toggleConfigShowingChange(
    stateWithUpdatedActiveTab,
    lineGroup.groupId
  );
}

/**
 * LOGS
 */
export function addOrReplaceLogsContext(
  currentState: Player,
  logsContext: LogsContext
): Player {
  const logsContextEntry = {
    [logsContext.contextName]: logsContext,
  };

  return mergeObjects<"logs", NonNullable<Player["logs"]>, "allContexts">(
    currentState,
    "logs",
    "allContexts",
    logsContextEntry
  );
}

export function setLogsActiveContext(
  currentState: Player,
  contextName: string
): Player {
  return mergeIntoSimulator<"logs", NonNullable<Player["logs"]>>(
    currentState,
    "logs",
    {
      activeContext: contextName,
    }
  );
}

export function addLogsRecords(
  currentState: Player,
  updates: Pick<LogsContext, "contextName" | "records">
): Player {
  return appendAt(
    currentState,
    "logs",
    ["allContexts", updates.contextName, "records"],
    updates.records
  );
}

/**
 * TERMINAL
 */
export function addTerminalStrings(
  currentState: Player,
  { strings }: NonNullable<Player["terminal"]>
): Player {
  return appendToArray<"terminal", NonNullable<Player["terminal"]>, "strings">(
    currentState,
    "terminal",
    "strings",
    strings
  );
}

export function setTerminalContentPrinted(currentState: Player, index: number) {
  const terminalContent = currentState.terminal!.strings;

  const printedTerminalContent = terminalContent.map((str, idx) =>
    idx === index
      ? {
          ...str,
          printed: true,
        }
      : str
  );

  return mergeIntoSimulator<"terminal", NonNullable<Player["terminal"]>>(
    currentState,
    "terminal",
    { strings: printedTerminalContent }
  );
}

/**
 * BANNER
 */
export function updateBannerState(
  currentState: Player,
  update: NonNullable<Player["banner"]>
): Player {
  return mergeIntoSimulator<"banner", NonNullable<Player["banner"]>>(
    currentState,
    SIMULATORS.BANNER,
    update
  );
}
