import { Tab, Tabs } from "@mui/material";
import { useCallback } from "react";
import { useGetConfigSimulatorContent } from "../../../hooks/useGetConfigSimulatorContent";
import type { EngineConfigTarget } from "../../../utils/engineTypesScratch";
import { ConfigTabPanel } from "./ConfigtabPanel";

export function Config(
  props: EngineConfigTarget & {
    onSetActiveTab: (tabName: string) => void;
    onToggleShowingChange: (groupId: string) => void;
    onConfigScrollComplete: (scrollId: string) => void;
  }
) {
  const {
    onSetActiveTab,
    activeTab,
    showingToggle,
    pulsedGroups,
    onToggleShowingChange,
    showingChange,
  } = props;
  const { tabContents } = useGetConfigSimulatorContent(props);

  const handleTabChange = useCallback(
    (_: React.SyntheticEvent, newValue: string) => {
      onSetActiveTab(newValue);
    },
    [onSetActiveTab]
  );

  return (
    <>
      <Tabs value={activeTab} onChange={handleTabChange}>
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
          groupsShowingChanges={showingChange}
          groupsShowingToggle={showingToggle}
          toggleGroupShowingChange={onToggleShowingChange}
          changeMap={tab.changeMap}
        />
      ))}
    </>
  );
}
