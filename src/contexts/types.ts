import type { NavigationState, StepItemId, TourState } from "../utils/types";
import type { ACTION_TYPES } from "./constants";

export interface PayloadMap {
  [ACTION_TYPES.BEGIN_ANIMATION]: undefined;
  [ACTION_TYPES.RESET_ANIMATION]: undefined;
  [ACTION_TYPES.INCREMENT_ANIMATION]: undefined;
  [ACTION_TYPES.SET_ANIMATION_INDEX]: number;
  [ACTION_TYPES.GO_BACK]: undefined;
  [ACTION_TYPES.GO_NEXT_STEP]: undefined;
  [ACTION_TYPES.GO_PREV_STEP]: undefined;
  [ACTION_TYPES.SET_NAVIGATION]: NavigationState;
  [ACTION_TYPES.TOGGLE_STEP]: StepItemId;
  [ACTION_TYPES.TOGGLE_SUB_STEP]: StepItemId;
  [ACTION_TYPES.OPEN_BIG_CONTENT_MODAL]: "contact" | "finished";
  [ACTION_TYPES.CLOSE_BIG_CONTENT_MODAL]: undefined;
  [ACTION_TYPES.START_LOGS_DEMO]: undefined;
}

export type AppAction = {
  [K in keyof PayloadMap]: PayloadMap[K] extends undefined
    ? { type: K }
    : { type: K; payload: PayloadMap[K] };
}[keyof PayloadMap];

export type ReducerFunction<K extends keyof PayloadMap> = (
  state: TourState,
  action: Extract<AppAction, { type: K }>
) => TourState;

export type ActionCreatorMap = {
  [K in keyof PayloadMap]: PayloadMap[K] extends undefined
    ? () => { type: K }
    : (payload: PayloadMap[K]) => { type: K; payload: PayloadMap[K] };
};

export type DispatchedActionCreators = {
  [K in keyof PayloadMap]: PayloadMap[K] extends undefined
    ? () => void
    : (payload: PayloadMap[K]) => void;
};
