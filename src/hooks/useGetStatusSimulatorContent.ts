import { selectPanelState } from "../contexts/selectors";
import { useHighlander } from "./useHighlander";
import { useSelector } from "./useSelector";

export function useGetStatusSimulatorContent() {
  const { status = {} } = useSelector(selectPanelState);
  const { actions } = useHighlander();

  return {
    ...status,
    incrementAnimation: actions.INCREMENT_ANIMATION,
  };
}
