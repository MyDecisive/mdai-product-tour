import { SIMULATORS } from "../utils/constants";
import type {
  ActivePod,
  EngineConfigTarget,
  EngineFileConfig,
  EngineLogsTarget,
  EngineStatusTarget,
  EngineTargetState,
  EngineTerminalTarget,
  LineGroup,
  PodId,
} from "../utils/engineTypesScratch";
import type { BannerTargetState, PodStatusType } from "../utils/types";

// ============================================================================
// TYPE-SAFE STATE TRANSFORMATION FUNCTIONS
// ============================================================================

// Generic merge for simple cases
export function mergeIntoSimulator<
  K extends keyof EngineTargetState,
  S extends NonNullable<EngineTargetState[K]>
>(
  currentState: EngineTargetState,
  simulator: K,
  updates: Partial<S>
): EngineTargetState {
  const current = currentState[simulator];
  return {
    ...currentState,
    [simulator]: { ...current, ...updates } as S,
  };
}

// Merge objects (for activePods, files, etc.)
export function mergeObjects<
  K extends keyof EngineTargetState,
  S extends NonNullable<EngineTargetState[K]>,
  ObjKey extends keyof S
>(
  currentState: EngineTargetState,
  simulator: K,
  objectKey: ObjKey,
  updates: S[ObjKey] extends Record<string, infer V> ? Record<string, V> : never
): EngineTargetState {
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

// Append to arrays
export function appendToArray<
  K extends keyof EngineTargetState,
  S extends NonNullable<EngineTargetState[K]>,
  ArrKey extends keyof S
>(
  currentState: EngineTargetState,
  simulator: K,
  arrayKey: ArrKey,
  items: S[ArrKey] extends Array<infer T> ? T[] : never
): EngineTargetState {
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
  K extends keyof EngineTargetState,
  S extends NonNullable<EngineTargetState[K]>,
  ObjKey extends keyof S,
  ItemKey extends keyof NonNullable<S[ObjKey]>
>(
  currentState: EngineTargetState,
  simulator: K,
  objectKey: ObjKey,
  itemKey: ItemKey,
  updates: Partial<NonNullable<S[ObjKey]>[ItemKey]>
): EngineTargetState {
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
  K extends keyof EngineTargetState,
  S extends NonNullable<EngineTargetState[K]>,
  SetKey extends keyof S
>(
  currentState: EngineTargetState,
  simulator: K,
  setKey: SetKey,
  value: S[SetKey] extends Set<infer T> ? T : never
): EngineTargetState {
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
  K extends keyof EngineTargetState,
  S extends NonNullable<EngineTargetState[K]>,
  ArrKey extends keyof S
>(
  currentState: EngineTargetState,
  simulator: K,
  arrayKey: ArrKey,
  predicate: (item: S[ArrKey] extends Array<infer T> ? T : never) => boolean
): EngineTargetState {
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
  K extends keyof EngineTargetState,
  S extends NonNullable<EngineTargetState[K]>,
  ObjKey extends keyof S
>(
  currentState: EngineTargetState,
  simulator: K,
  objectKey: ObjKey,
  keysToRemove: (keyof NonNullable<S[ObjKey]>)[]
): EngineTargetState {
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

export function addStatusPods(
  currentState: EngineTargetState,
  updates: EngineStatusTarget
): EngineTargetState {
  let state = mergeObjects<"status", EngineStatusTarget, "activePods">(
    currentState,
    "status",
    "activePods",
    updates.activePods
  );

  state = appendToArray<"status", EngineStatusTarget, "podOrder">(
    state,
    "status",
    "podOrder",
    updates.podOrder
  );

  return state;
}

export function updatePodStatus(
  currentState: EngineTargetState,
  {
    podId,
    status,
    incrementRestarts,
  }: {
    podId: PodId;
    status: PodStatusType;
    incrementRestarts?: boolean;
  }
): EngineTargetState {
  const pod = currentState.status?.activePods[podId];
  if (!pod) return currentState;

  const updates: Partial<ActivePod> = {
    status,
    ...(incrementRestarts && { restartCount: pod.restartCount + 1 }),
  };

  return mergeObjects<"status", EngineStatusTarget, "activePods">(
    currentState,
    "status",
    "activePods",
    { [podId]: { ...pod, ...updates } }
  );
}

export function removeStatusPods(
  currentState: EngineTargetState,
  podIds: Set<PodId>
): EngineTargetState {
  let state = removeFromArray<"status", EngineStatusTarget, "podOrder">(
    currentState,
    "status",
    "podOrder",
    (id) => !podIds.has(id)
  );

  state = removeFromObject<"status", EngineStatusTarget, "activePods">(
    state,
    "status",
    "activePods",
    Array.from(podIds)
  );

  return state;
}

export function setConfigActiveTab(
  currentState: EngineTargetState,
  tabName: string
): EngineTargetState {
  return mergeIntoSimulator<"config", EngineConfigTarget>(
    currentState,
    "config",
    { activeTab: tabName }
  );
}

export function toggleConfigShowingChange(
  currentState: EngineTargetState,
  groupId: string
): EngineTargetState {
  let state = currentState;
  const config = state.config;

  if (!config?.showingToggle.has(groupId)) {
    state = toggleInSet<"config", EngineConfigTarget, "showingToggle">(
      state,
      "config",
      "showingToggle",
      groupId
    );
  }

  return toggleInSet<"config", EngineConfigTarget, "showingChange">(
    state,
    "config",
    "showingChange",
    groupId
  );
}

function mergeConfigSets(
  currentState: EngineTargetState,
  incomingSets: Partial<
    Pick<EngineConfigTarget, "showingToggle" | "showingChange">
  >
): EngineTargetState {
  const currentConfig = currentState.config;
  if (!currentConfig) {
    // No config yet; if incoming sets provided, create a new config skeleton
    const newConfig: EngineConfigTarget = {
      files: {},
      activeTab: "",
      showingToggle: incomingSets.showingToggle
        ? new Set(incomingSets.showingToggle)
        : new Set(),
      showingChange: incomingSets.showingChange
        ? new Set(incomingSets.showingChange)
        : new Set(),
    };

    return mergeIntoSimulator<"config", EngineConfigTarget>(
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

  return mergeIntoSimulator<"config", EngineConfigTarget>(
    currentState,
    "config",
    {
      showingToggle: combinedToggle,
      showingChange: combinedChange,
    }
  );
}

function addOrReplaceConfigFile(
  currentState: EngineTargetState,
  files: Record<string, EngineFileConfig>
): EngineTargetState {
  return mergeObjects<"config", EngineConfigTarget, "files">(
    currentState,
    "config",
    "files",
    files
  );
}

export function addConfigTarget(
  currentState: EngineTargetState,
  update: EngineConfigTarget
): EngineTargetState {
  const { files, showingChange, showingToggle, activeTab } = update;
  let state = addOrReplaceConfigFile(currentState, files);

  if (showingToggle || showingChange) {
    state = mergeConfigSets(state, {
      showingChange,
      showingToggle,
    });
  }

  if (activeTab) {
    state = mergeIntoSimulator(state, "config", {
      activeTab,
    });
  }

  return state;
}

export function addLogsRecords(
  currentState: EngineTargetState,
  { records }: Pick<EngineLogsTarget, "records">
): EngineTargetState {
  return appendToArray<"logs", EngineLogsTarget, "records">(
    currentState,
    "logs",
    "records",
    records
  );
}

export function addTerminalStrings(
  currentState: EngineTargetState,
  { strings }: Pick<EngineTerminalTarget, "strings">
): EngineTargetState {
  return appendToArray<"terminal", EngineTerminalTarget, "strings">(
    currentState,
    "terminal",
    "strings",
    strings
  );
}

export function scrollToConfigLine(
  currentState: EngineTargetState,
  {
    fileName,
    line,
  }: {
    fileName: string;
    line: number;
  }
): EngineTargetState {
  const config = currentState.config;
  if (!config || !config.files[fileName]) {
    return currentState;
  }

  const file = config.files[fileName];

  const { groupId } = (file.groups.find((grp) => {
    const isLineGroup = grp.type === "group";
    if (!isLineGroup) {
      return;
    }
    return grp.start <= line && line <= grp.end;
  }) || {}) as LineGroup;

  if (!groupId) {
    return currentState;
  }

  const stateWithUpdatedActiveTab = setConfigActiveTab(currentState, fileName);

  return toggleConfigShowingChange(stateWithUpdatedActiveTab, groupId);
}

export function updateBannerState(
  currentState: EngineTargetState,
  update: BannerTargetState
): EngineTargetState {
  return mergeIntoSimulator<"banner", BannerTargetState>(
    currentState,
    SIMULATORS.BANNER,
    update
  );
}
