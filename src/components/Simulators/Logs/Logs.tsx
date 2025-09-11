import { Box } from "@mui/material";
import React from "react";
import { useGetLogsSimulatorContent } from "../../../hooks/useGetLogsSimulatorContent";
import { SimulatorContextLabel } from "../SimContextLabel";
import { LogRow } from "./LogRow";

export const LogsSimulator: React.FC = () => {
  const { logContainerRef, contextLabel, displayedLogs } =
    useGetLogsSimulatorContent();

  return (
    <>
      <SimulatorContextLabel>{contextLabel}</SimulatorContextLabel>
      <Box
        ref={logContainerRef}
        sx={{
          scrollBehavior: "smooth",
          overflowY: "auto",
          maxHeight: "350px",
        }}
      >
        {displayedLogs.map((log) => (
          <LogRow key={log.id} {...log} />
        ))}
      </Box>
    </>
  );
};
