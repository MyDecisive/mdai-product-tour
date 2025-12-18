import { Box } from "@mui/material";
import React, { useMemo } from "react";
import { useGetLogsSimulatorContent } from "../../../hooks/useGetLogsSimulatorContent";
import type {
  ActivePodMap,
  EngineLogsTarget,
} from "../../../utils/engineTypesScratch";
import { SimulatorContextLabel } from "../SimContextLabel";
import { LogRow } from "./LogRow";

export const LogsSimulator: React.FC<
  EngineLogsTarget & { playing: boolean; activeStatusPods: ActivePodMap }
> = ({ activeContext, allContexts, playing, activeStatusPods }) => {
  const { logContainerRef, records } = useGetLogsSimulatorContent({
    allContexts,
    activeContext,
    playing,
  });

  const activeContextLabel = useMemo(() => {
    const podObjects = Object.values(activeStatusPods);
    if (!activeContext || !podObjects.length) {
      return "";
    }

    const relevantPod = podObjects.find((pod) =>
      pod.name.startsWith(activeContext)
    );
    if (!relevantPod) {
      return "";
    }

    return relevantPod.name;
  }, [activeContext, activeStatusPods]);

  return (
    <>
      {activeContextLabel && (
        <SimulatorContextLabel>{activeContextLabel}</SimulatorContextLabel>
      )}
      <Box
        className="log-rows-container"
        ref={logContainerRef}
        sx={{
          overflowY: "auto",
          maxHeight: "350px",
          maxWidth: "100%",
          boxSizing: "border-box",
        }}
      >
        {records.map((log) => (
          <LogRow key={log.id} {...log} />
        ))}
      </Box>
    </>
  );
};
