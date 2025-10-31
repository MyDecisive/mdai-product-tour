import { useMemo } from "react";
import type { EngineConfigTarget } from "../../utils/engineTypesScratch";
import type { SimulatorType } from "../../utils/types";
import { useManageScrollToAndToggle } from "./useManageScrollToAndToggle";
import { usePulsedGroup } from "./usePulsedGroup";

export function useGetConfigSimulatorContent({
  files,
  activeTab,
  showingChange,
  onAnimationComplete,
  onToggleShowingChange,
}: EngineConfigTarget & {
  onSetActiveTab: (tabName: string) => void;
  onAnimationComplete: (sim?: SimulatorType) => void;
  onToggleShowingChange: (groupId: string) => void;
}) {
  const { pulsedGroups, addPulsedGroup } = usePulsedGroup();

  const {
    groupsShowingChange,
    makeSetContainerRef,
    handleToggleShowingChange,
  } = useManageScrollToAndToggle({
    activeTab,
    showingChange,
    onAnimationComplete,
    addPulsedGroup,
    onToggleShowingChange,
  });

  const tabContents = useMemo(() => {
    return Object.values(files).map((file) => ({
      ...file,
      makeSetContainerRef,
    }));
  }, [files, makeSetContainerRef]);

  return {
    tabContents,
    activeTab,
    groupsShowingChange,
    pulsedGroups,
    handleToggleShowingChange,
  };
}
