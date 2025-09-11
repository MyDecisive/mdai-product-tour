import { selectInTour, selectPanelState } from "../contexts/selectors";
import { useSelector } from "./useSelector";

export function useGetPanelContent() {
  const inTour = useSelector(selectInTour);
  const panelState = useSelector(selectPanelState);

  return {
    panelState,
    inTour,
  };
}
