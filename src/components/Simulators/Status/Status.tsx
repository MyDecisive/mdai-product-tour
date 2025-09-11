import { Typography } from "@mui/material";
import { type FC } from "react";
import { useGetStatusSimulatorContent } from "../../../hooks/useGetStatusSimulatorContent";
import { SimulatorContextLabel } from "../SimContextLabel";
import { ServiceRow } from "./ServiceRow";
import { StyledRow } from "./StyledRow";

export const Status: FC = () => {
  const {
    services = [],
    contextLabel,
    handlePodRemove,
    handleStatusChange,
  } = useGetStatusSimulatorContent();

  return (
    <>
      <SimulatorContextLabel>{contextLabel}</SimulatorContextLabel>
      <StyledRow
        name="NAME"
        ready="READY"
        status="STATUS"
        restarts="RESTARTS"
        containerStyles={{
          borderBottom: "1px solid rgba(111, 111, 111, 0.50)",
        }}
      />

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
    </>
  );
};
