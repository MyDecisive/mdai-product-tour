import { selectPanelState } from "../contexts/selectors";
import { useHighlander } from "./useHighlander";
import { useSelector } from "./useSelector";

export function useGetTerminalSimulatorContent() {
  const { terminal = {} } = useSelector(selectPanelState);
  const { actions } = useHighlander();

  return {
    ...terminal,
    incrementAnimation: actions.INCREMENT_ANIMATION,
  };
}
