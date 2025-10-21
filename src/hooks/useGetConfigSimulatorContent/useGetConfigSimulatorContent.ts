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
}: EngineConfigTarget & {
  onSetActiveTab: (tabName: string) => void;
  onRevealToggleControl: (groupId: string) => void;
  onAnimationComplete: (sim?: SimulatorType) => void;
}) {
  const { pulsedGroups, addPulsedGroup } = usePulsedGroup();

  const { containerRefs, groupsShowingChange, setContainerRef } =
    useManageScrollToAndToggle({
      activeTab,
      showingChange,
      onAnimationComplete,
      addPulsedGroup,
    });

  const tabContents = useMemo(() => {
    return Object.values(files).map((file) => ({
      ...file,
      ref: containerRefs.current[file.fileName],
      setContainerRef,
    }));
  }, [files, containerRefs, setContainerRef]);

  return {
    tabContents,
    activeTab,
    groupsShowingChange,
    pulsedGroups,
  };
}
