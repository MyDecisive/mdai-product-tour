import { Box } from "@mui/material";
import React from "react";
import { useGetLogsSimulatorContent } from "../../../hooks/useGetLogsSimulatorContent";
import type { EngineLogsTarget } from "../../../utils/engineTypesScratch";
import { LogRow } from "./LogRow";

export const LogsSimulator: React.FC<
  Pick<EngineLogsTarget, "records"> & { playing: boolean }
> = ({ records, playing }) => {
  const { logContainerRef } = useGetLogsSimulatorContent({ records, playing });
  return (
    <>
      <Box
        className="log-rows-container"
        ref={logContainerRef}
        sx={{
          scrollBehavior: "smooth",
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
