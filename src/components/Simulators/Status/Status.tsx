import { Box, Typography } from "@mui/material";
import { type FC } from "react";
import { useGetStatusSimulatorContent } from "../../../hooks/useGetStatusSimulatorContent";
import { SimulatorContextLabel } from "../SimContextLabel";
import { ServiceRow } from "./ServiceRow";
import { StyledRow } from "./StyledRow";

const HEADER_ROW_HEIGHT = 20;

export const Status: FC = () => {
  const {
    services = [],
    contextLabel,
    handlePodRemove,
    handleStatusChange,
    serviceContainerRef,
  } = useGetStatusSimulatorContent();

  return (
    <>
      <SimulatorContextLabel>{contextLabel}</SimulatorContextLabel>
      <Box
        sx={{
          maxHeight: "350px",
        }}
      >
        <StyledRow
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
            const { name, beingReplaced, id, status } = service;

            return (
              <ServiceRow
                key={id}
                podId={id}
                beingReplaced={beingReplaced}
                status={status}
                name={name}
                onStatusChange={handleStatusChange}
                onRemove={handlePodRemove}
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
