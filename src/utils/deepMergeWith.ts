import type { DeepPartial } from "./types";

function isObject(item: unknown): item is Record<string, unknown> {
  return (
    item !== null &&
    typeof item === "object" &&
    !Array.isArray(item) &&
    !(item instanceof Set) &&
    !(item instanceof Map)
  );
}

/**
 * Recursively merges properties of the source object into the target object,
 * with an optional customizer function to control how values are merged.
 *
 * @template T The type of the target object.
 * @param target The target object to merge into.
 * @param source The source object with properties to merge.
 * @param customizer An optional function that takes (targetValue, sourceValue, key, target, source)
 *                   and returns the merged value or undefined to use default merging.
 * @returns A new object with merged properties from both target and source.
 */
export function deepMergeWith<T>(
  target: T,
  source: DeepPartial<T>,
  customizer?: (
    targetValue: unknown,
    sourceValue: unknown,
    key: string,
    targetObj: unknown,
    sourceObj: unknown
  ) => unknown
): T {
  function mergeRec(
    targetNode: unknown,
    sourceNode: unknown,
    targetObj: unknown,
    sourceObj: unknown
  ): unknown {
    // Handle Sets
    if (sourceNode instanceof Set && targetNode instanceof Set) {
      if (customizer) {
        const merged = customizer(
          targetNode,
          sourceNode,
          "",
          targetObj,
          sourceObj
        );
        if (merged !== undefined) return merged;
      }
      return new Set(sourceNode); // Replace with new Set
    }

    // Handle Maps
    if (sourceNode instanceof Map && targetNode instanceof Map) {
      if (customizer) {
        const merged = customizer(
          targetNode,
          sourceNode,
          "",
          targetObj,
          sourceObj
        );
        if (merged !== undefined) return merged;
      }
      return new Map(sourceNode); // Replace with new Map
    }

    if (isObject(sourceNode) && isObject(targetNode)) {
      const result: Record<string, unknown> = { ...targetNode };
      for (const key in sourceNode) {
        if (!Object.prototype.hasOwnProperty.call(sourceNode, key)) continue;

        const sourceValue = sourceNode[key];
        const targetValue = result[key];

        let mergedValue: unknown = undefined;
        if (customizer) {
          mergedValue = customizer(
            targetValue,
            sourceValue,
            key,
            targetObj,
            sourceObj
          );
        }

        if (mergedValue !== undefined) {
          result[key] = mergedValue;
        } else if (isObject(sourceValue) && isObject(targetValue)) {
          result[key] = mergeRec(
            targetValue,
            sourceValue,
            targetObj,
            sourceObj
          );
        } else if (sourceValue !== undefined) {
          result[key] = sourceValue;
        }
      }
      return result;
    } else if (Array.isArray(sourceNode) && Array.isArray(targetNode)) {
      if (customizer) {
        const merged = customizer(
          targetNode,
          sourceNode,
          "",
          targetObj,
          sourceObj
        );
        if (merged !== undefined) return merged;
      }
      return sourceNode;
    } else if (sourceNode !== undefined) {
      return sourceNode;
    }
    return targetNode;
  }

  return mergeRec(target, source, target, source) as T;
}

/**
 * customizer examples
1. Append arrays instead of replace
const mergedArrays = deepMergeWith(
  { nums: [1, 2] },
  { nums: [3, 4] },
  (targetVal, sourceVal) => {
    if (Array.isArray(targetVal) && Array.isArray(sourceVal)) {
      return [...targetVal, ...sourceVal];
    }
    return undefined;
  }
);
result: { nums: [1, 2, 3, 4] }

2. Merge Sets by union
const mergedSets = deepMergeWith(
  { tags: new Set([1, 2]) },
  { tags: new Set([2, 3]) },
  (targetVal, sourceVal) => {
    if (targetVal instanceof Set && sourceVal instanceof Set) {
      return new Set([...targetVal, ...sourceVal]);
    }
    return undefined;
  }
);
result: { tags: Set([1, 2, 3]) }

3. Merge Maps by combining entries
const mergedMaps = deepMergeWith(
  { cache: new Map([['a', 1]]) },
  { cache: new Map([['b', 2]]) },
  (targetVal, sourceVal) => {
    if (targetVal instanceof Map && sourceVal instanceof Map) {
      return new Map([...targetVal, ...sourceVal]);
    }
    return undefined;
  }
);
result: { cache: Map([['a', 1], ['b', 2]]) }
 */
