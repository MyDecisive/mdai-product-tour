import { createContext } from "react";
import type { TourState } from "../utils/types";
import type { DispatchedActionCreators } from "./types";

export interface HighlanderContextValue {
  state: TourState;
  actions: DispatchedActionCreators;
}

export const HighlanderContext = createContext<
  HighlanderContextValue | undefined
>(undefined);
