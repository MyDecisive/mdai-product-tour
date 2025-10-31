import { Tab, Tabs } from "@mui/material";
import { useCallback } from "react";
import { useGetConfigSimulatorContent } from "../../../hooks/useGetConfigSimulatorContent";
import type { EngineConfigTarget } from "../../../utils/engineTypesScratch";
import type { SimulatorType } from "../../../utils/types";
import { ConfigTabPanel } from "./ConfigtabPanel";

export function Config(
  props: EngineConfigTarget & {
    onSetActiveTab: (tabName: string) => void;
    onToggleShowingChange: (groupId: string) => void;
    onAnimationComplete: (sim?: SimulatorType) => void;
  }
) {
  const { onSetActiveTab, activeTab, showingToggle } = props;
  const {
    tabContents,
    groupsShowingChange,
    pulsedGroups,
    handleToggleShowingChange,
  } = useGetConfigSimulatorContent(props);

  const handleChange = useCallback(
    (_: React.SyntheticEvent, newValue: string) => {
      onSetActiveTab(newValue);
    },
    [onSetActiveTab]
  );

  return (
    <>
      <Tabs value={activeTab} onChange={handleChange}>
        {tabContents.map(({ fileName }) => (
          <Tab
            key={fileName}
            label={fileName}
            value={fileName}
            aria-controls={`${fileName}-control-tab`}
          />
        ))}
      </Tabs>
      {tabContents.map((tab) => (
        <ConfigTabPanel
          key={tab.fileName}
          {...tab}
          active={activeTab === tab.fileName}
          pulsedGroups={pulsedGroups}
          groupsShowingChanges={groupsShowingChange}
          groupsShowingToggle={showingToggle}
          toggleGroupShowingChange={handleToggleShowingChange}
          changeMap={tab.changeMap}
        />
      ))}
    </>
  );
}
