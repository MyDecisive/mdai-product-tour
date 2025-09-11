import { useMemo } from "react";
import type { TourState } from "../utils/types";
import { useHighlander } from "./useHighlander";

export function useSelector<T>(selector: (state: TourState) => T): T {
  const { state } = useHighlander();
  return useMemo(() => selector(state), [state, selector]);
}
