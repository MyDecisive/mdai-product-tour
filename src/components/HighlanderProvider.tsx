import { type ReactNode, useMemo, useReducer } from "react";
import { createActionCreator } from "../contexts/actions";
import { ACTION_TYPES } from "../contexts/constants";
import { HighlanderContext } from "../contexts/highlander";
import { reducer } from "../contexts/reducers";
import type {
  AppAction,
  DispatchedActionCreators,
  PayloadMap,
} from "../contexts/types";
import type { TourState } from "../utils/types";

interface HighlanderProviderProps {
  children: ReactNode;
  initialState: TourState;
}

export function HighlanderProvider({
  children,
  initialState,
}: HighlanderProviderProps) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const dispatchedActionCreators = useMemo(
    () =>
      (Object.values(ACTION_TYPES) as (keyof PayloadMap)[]).reduce(
        (acc, actionType) => {
          const actionCreator = createActionCreator(
            actionType
          ) as PayloadMap[typeof actionType] extends undefined
            ? () => AppAction
            : (payload: PayloadMap[typeof actionType]) => AppAction;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          acc[actionType] = ((arg: any) => dispatch(actionCreator(arg))) as any;

          return acc;
        },
        {} as DispatchedActionCreators
      ),
    []
  );

  const contextValue = useMemo(
    () => ({
      state,
      actions: dispatchedActionCreators,
    }),
    [state, dispatchedActionCreators]
  );

  return (
    <HighlanderContext.Provider value={contextValue}>
      {children}
    </HighlanderContext.Provider>
  );
}
