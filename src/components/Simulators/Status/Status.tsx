import { Box, Typography } from "@mui/material";
import { type FC } from "react";
import { useGetStatusSimulatorContent } from "../../../hooks/useGetStatusSimulatorContent";
import { ServiceRow } from "./ServiceRow";
import { StyledRow } from "./StyledRow";
import type { PodStatusType } from "../../../types/kinds";
import type { EngineStatusTarget, PodId } from "../../../types/player";

const HEADER_ROW_HEIGHT = 20;
// TODO: Move these prop types to a types file
export interface StatusSimulatorProps extends EngineStatusTarget {
  onPodStatusChange: (podId: PodId, newStatus: PodStatusType) => void;
  playing: boolean;
  activeLogContext: string | undefined;
}

export const Status: FC<StatusSimulatorProps> = ({
  activePods,
  podOrder,
  onPodStatusChange,
  playing,
  activeLogContext = "",
}: StatusSimulatorProps) => {
  const {
    services = [],
    // contextLabel,
    serviceContainerRef,
  } = useGetStatusSimulatorContent({
    activePods,
    podOrder,
    playing,
    activeLogContext,
  });

  return (
    <>
      {/* <SimulatorContextLabel>{contextLabel}</SimulatorContextLabel> */}
      <Box
        sx={{
          maxHeight: "350px",
        }}
      >
        <StyledRow
          namespace="NAMESPACE"
          name="NAME"
          ready="READY"
          status="STATUS"
          restarts="RESTARTS"
          containerStyles={{
            borderBottom: "1px solid rgba(111, 111, 111, 0.50)",
          }}
        />
        <Box
          ref={serviceContainerRef}
          sx={{
            scrollBehavior: "smooth",
            overflowY: "auto",
            maxHeight: `calc(350px - ${HEADER_ROW_HEIGHT}px )`,
          }}
        >
          {services.map((service) => {
            const {
              name,
              id,
              status,
              restartCount,
              namespace,
              isActiveLogsContext,
            } = service;

            return (
              <ServiceRow
                key={id}
                namespace={namespace}
                isActiveLogsContext={isActiveLogsContext}
                id={id}
                status={status}
                name={name}
                restartCount={restartCount}
                onStatusChange={onPodStatusChange}
              />
            );
          })}

          {services.length === 0 && (
            <Typography className="text-gray-500 text-center py-4">
              No pods running
            </Typography>
          )}
        </Box>
      </Box>
    </>
  );
};
