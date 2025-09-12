import { selectPanelState } from "../contexts/selectors";
import { useHighlander } from "./useHighlander";
import { useSelector } from "./useSelector";

export function useGetConfigSimulatorContent() {
  const { config = {} } = useSelector(selectPanelState);
  const { actions } = useHighlander();

  return {
    ...config,
    incrementAnimation: actions.INCREMENT_ANIMATION,
  };
}
