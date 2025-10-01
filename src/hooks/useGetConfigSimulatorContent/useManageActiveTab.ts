import { useCallback, useEffect } from "react";
import { selectActiveTab } from "../../contexts/selectors";
import { useHighlander } from "../useHighlander";
import { useSelector } from "../useSelector";

export function useManageActiveTab(activeFileTitle?: string) {
  const { actions } = useHighlander();
  const activeTab = useSelector(selectActiveTab);

  const setActiveTab = useCallback(
    (tab?: string) => {
      actions.SET_ACTIVE_TAB(tab);
    },
    [actions]
  );

  useEffect(() => {
    setActiveTab(activeFileTitle);
  }, [activeFileTitle, setActiveTab]);

  return {
    activeTab: activeTab || activeFileTitle || "",
    setActiveTab,
  };
}
