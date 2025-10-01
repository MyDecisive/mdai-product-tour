import { useCallback, useMemo } from "react";
import { selectPanelState } from "../../contexts/selectors";
import {
  type ConfigTextProps,
  type LineToggles,
  type TextGroup,
} from "../../utils/types";
import { useSelector } from "../useSelector";
import { useLineToggles } from "./useLineToggles";
import { useManageActiveTab } from "./useManageActiveTab";
import { useManageScrollToAndToggle } from "./useManageScrollToAndToggle";
import { usePulsedLines } from "./usePulsedLines";
import { useResetObsoleteToggles } from "./useResetObsoleteToggles";
import { createTextGroups, rawLinesFromText, useStableValue } from "./utils";

export function useGetConfigSimulatorContent() {
  const { config } = useSelector(selectPanelState);

  const { files = {}, activeFileTitle } = (config || {}) as ConfigTextProps;

  const { activeTab, setActiveTab } = useManageActiveTab(activeFileTitle);

  const fileNames = useMemo(() => Object.keys(files).sort(), [files]);

  const { lineToggles, toggleLines, resetToggles } = useLineToggles(files);
  const { pulsedLines, addPulsedLines } = usePulsedLines(fileNames);

  const toggleLineValue = useCallback(
    (fileName: string, lineNos: number[]) => {
      toggleLines(fileName, lineNos);
      addPulsedLines(fileName, lineNos);
    },
    [toggleLines, addPulsedLines]
  );

  const stableToggles =
    useStableValue<Record<string, LineToggles>>(lineToggles);

  const stableInitialToggles = useStableValue(
    Object.values(files).map((file) => file.initialLineToggles ?? {})
  );

  const { containerRefs } = useManageScrollToAndToggle({
    activeTab,
    files,
    fileNames,
    stableInitialToggles,
    toggleLineValue,
  });

  useResetObsoleteToggles({
    files,
    lineToggles,
    stableToggles,
    stableInitialToggles,
    resetToggles,
  });

  const fileTexts = useMemo(() => {
    return Object.values(files).map((file) => file.text ?? "");
  }, [files]);

  const rawLinesByFile = useMemo(() => {
    return Object.entries(files).reduce((accum, [fileName, { text }]) => {
      accum[fileName] = rawLinesFromText(text ?? "");
      return accum;
    }, {} as Record<string, string[]>);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fileTexts]);

  const stableChanges = useStableValue(
    JSON.stringify(Object.values(files).flatMap((file) => file.changes || []))
  );

  const textGroupsByFile = useMemo(() => {
    return Object.entries(files).reduce((accum, [fileName, fileConfig]) => {
      accum[fileName] = createTextGroups(
        rawLinesByFile[fileName] || [],
        fileConfig.changes || [],
        lineToggles[fileName] || {}
      );
      return accum;
    }, {} as Record<string, TextGroup[]>);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rawLinesByFile, stableChanges, stableToggles]);

  const fileMetadata = useMemo(() => {
    return Object.entries(files).map(([name, config]) => ({
      title: name,
      href: config.href,
      showToggleButtons: config.showToggleButtons,
    }));
  }, [files]);

  const tabContents = useMemo(() => {
    return fileMetadata.map(({ title, href, showToggleButtons }) => ({
      title,
      href,
      showToggleButtons,
      textGroups: textGroupsByFile[title],
      pulsedLines: pulsedLines[title] || new Set(),
      containerRef: containerRefs.current[title],
      toggleLineValue: (lineNos: number[]) => toggleLineValue(title, lineNos),
    }));
  }, [
    fileMetadata,
    textGroupsByFile,
    pulsedLines,
    containerRefs,
    toggleLineValue,
  ]);

  return {
    tabContents,
    activeTab,
    setActiveTab,
  };
}
