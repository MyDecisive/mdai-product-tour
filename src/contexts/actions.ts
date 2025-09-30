import { ACTION_TYPES } from "./constants";
import type { ActionCreatorMap, PayloadMap } from "./types";

export function createActionCreator<K extends keyof PayloadMap>(
  actionType: K
): ActionCreatorMap[K] {
  return ((payload?: PayloadMap[K]) =>
    payload === undefined
      ? { type: actionType }
      : { type: actionType, payload }) as ActionCreatorMap[K];
}

export const actions: ActionCreatorMap = (
  Object.values(ACTION_TYPES) as (keyof PayloadMap)[]
).reduce((acc, actionType) => {
  const actionCreator = createActionCreator(actionType);
  // TODO: Figure out a way to not cast as any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment
  acc[actionType] = actionCreator as any;
  return acc;
}, {} as ActionCreatorMap);
