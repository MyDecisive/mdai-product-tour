import { Box } from "@mui/material";
import React from "react";
import { useGetLogsSimulatorContent } from "../../../hooks/useGetLogsSimulatorContent";
import type { EngineLogsTarget } from "../../../utils/engineTypesScratch";
import { SimulatorContextLabel } from "../SimContextLabel";
import { LogRow } from "./LogRow";

export const LogsSimulator: React.FC<
  Pick<EngineLogsTarget, "records" | "contextLabel"> & { playing: boolean }
> = ({ contextLabel, records, playing }) => {
  const { logContainerRef } = useGetLogsSimulatorContent({ records, playing });
  return (
    <>
      {contextLabel && (
        <SimulatorContextLabel>{contextLabel}</SimulatorContextLabel>
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
