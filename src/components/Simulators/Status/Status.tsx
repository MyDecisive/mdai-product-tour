import { Box, Typography } from "@mui/material";
import { type FC } from "react";
import { useGetStatusSimulatorContent } from "../../../hooks/useGetStatusSimulatorContent";
import type { PodStatus } from "../../../types/kinds";
import type { Player, PodId } from "../../../types/player";
import { ServiceRow } from "./ServiceRow";
import { StyledRow } from "./StyledRow";

const HEADER_ROW_HEIGHT = 20;

export interface StatusSimulatorProps extends NonNullable<Player["status"]> {
  onPodStatusChange: (podId: PodId, newStatus: PodStatus) => void;
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
