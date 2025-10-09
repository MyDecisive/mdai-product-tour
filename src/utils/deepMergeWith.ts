import type { DeepPartial } from "./types";

function isObject(item: unknown): item is Record<string, unknown> {
  return item !== null && typeof item === "object" && !Array.isArray(item);
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
    // fallback to default behavior:
    return undefined;
  }
);
result: { nums: [1, 2, 3, 4] }

2. Always prefer source values, deep or shallow
const preferSource = deepMergeWith(
  { x: 1, y: { z: 2 } },
  { x: 5, y: { z: 99 } },
  (_targetVal, sourceVal) => sourceVal
);
result: { x: 5, y: { z: 99 } }

3. Skip merging a specific key
const skipKey = deepMergeWith(
  { settings: { theme: 'dark' }, version: 1 },
  { settings: { theme: 'light' }, version: 2 },
  (targetVal, sourceVal, key) => {
    if (key === 'settings') return targetVal; // don't merge settings
    return undefined;
  }
);
result: { settings: { theme: 'dark' }, version: 2 }

const customizer = (targetVal, sourceVal, key, targetObj, sourceObj) => {
  if (sourceObj.skipMerge) {
    // Don't merge anything if skipMerge is true in the source root
    return targetVal;
  }
  return undefined;
};

const merged = deepMergeWith(target, source, customizer);
Result: { a: { b: 1 }, skipMerge: true }
 */
