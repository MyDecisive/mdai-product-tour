import { selectDrawerHeaderText, selectInTour } from "../contexts/selectors";
import { useHighlander } from "./useHighlander";
import { useSelector } from "./useSelector";

export function useGetDrawerHeaderProps() {
  const { actions } = useHighlander();
  const drawerHeaderText = useSelector(selectDrawerHeaderText);
  const inTour = useSelector(selectInTour);

  return {
    inTour,
    drawerHeaderText,
    handleBackButtonClick: actions.GO_BACK,
  };
}
