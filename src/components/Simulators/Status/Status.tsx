import { Typography } from "@mui/material";
import { type FC, useCallback, useEffect, useRef, useState } from "react";
import { useAnimationIndex } from "../../../hooks/useAnimationIndex";
import type { Service, StatusProps } from "../../../utils/types";
import { SimulatorContextLabel } from "../SimContextLabel";
import { ServiceRow } from "./ServiceRow";
import { StyledRow } from "./StyledRow";
import { STATUS } from "./constants";
import type { PodId, StatusString } from "./types";

type PodStatuses = Record<
  string,
  (typeof STATUS)[keyof typeof STATUS] | undefined
>;

const ADDR_DELIM = "@";
const REPLICA_DELIM = "^";

function createServiceKey(svc: Service, addr: number) {
  return `${svc.name}-${svc.skipStartup || false}${REPLICA_DELIM}${
    svc.replicas || 1
  }${ADDR_DELIM}${addr}`;
}

function createPodId(svc: Service, replicaNo: number, addr: number) {
  return `${svc.name}-${
    svc.skipStartup || false
  }${REPLICA_DELIM}${replicaNo}${ADDR_DELIM}${addr}`;
}

type ActivePod = {
  name: string;
  status?: StatusString;
  skipStartup?: boolean;
  replicaNo: number;
  parentServiceKey: string;
  shouldReplace?: PodId;
};

type ActivePodMap = Record<PodId, ActivePod>;

type ConvertReturnVal = {
  newPodOrder: PodId[];
  newActivePods: ActivePodMap;
  newProcessedServices: string[];
};

function createEmptyActivePods() {
  return {} as ActivePodMap;
}

function servicesToActivePods(services: Service[]) {
  return services.reduce(
    (accum, service, idx) => {
      const serviceKey = createServiceKey(service, idx);
      accum.newProcessedServices.push(serviceKey);

      const replicas = service.replicas || 1;

      for (let i = 1; i <= replicas; i++) {
        const replicaNo = i;
        const newPodId = createPodId(service, replicaNo, idx);
        accum.newPodOrder.push(newPodId);

        const newPod = {
          name: service.name,
          status: undefined,
          skipStartup: service.skipStartup,
          replicaNo,
          parentServiceKey: serviceKey,
        };

        accum.newActivePods[newPodId] = newPod;
      }

      return accum;
    },
    {
      newPodOrder: [],
      newActivePods: createEmptyActivePods(),
      newProcessedServices: [],
    } as ConvertReturnVal
  );
}

export const Status: FC<StatusProps> = ({ services = [], namespace }) => {
  const { incrementAnimation } = useAnimationIndex();
  const [podOrder, setPodOrder] = useState<PodId[]>([]);
  const [activePods, setActivePods] = useState<ActivePodMap>({});
  const [podStatuses, setPodStatuses] = useState<PodStatuses>({});
  const processedServices = useRef<string[]>([]);

  const handleStatusChange = useCallback((podId: string, status: string) => {
    setPodStatuses((prev) => ({ ...prev, [podId]: status }));
  }, []);

  const handlePodRemove = useCallback((podId: string) => {
    setPodStatuses((prev) => {
      const newStatuses = { ...prev };
      delete newStatuses[podId];
      return newStatuses;
    });
    setPodOrder((old) => old.filter((id) => id !== podId));
    setActivePods((old) => {
      const newActivePods = { ...old };
      delete newActivePods[podId];
      return newActivePods;
    });
  }, []);

  useEffect(() => {
    const activePods = Object.entries(podStatuses);
    const allStabilized =
      activePods.length > 0 &&
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      activePods.every(([_, status]) => status === "Running");

    if (allStabilized) {
      incrementAnimation();
    }
  }, [podStatuses, incrementAnimation]);

  useEffect(() => {
    // NOTE: The code below expects `services` to _always_ grow

    // TODO: Handle `services` being smaller (new array).
    const newServices = services.filter((service, idx) => {
      const key = createServiceKey(service, idx);
      return !processedServices.current.includes(key);
    });

    if (newServices.length === 0) return;

    const { newPodOrder, newActivePods, newProcessedServices } =
      servicesToActivePods(newServices);

    const newActivePodsWithShouldReplace = newPodOrder.reduce(
      (accum, podId) => {
        const partialPod = newActivePods[podId];
        const shouldReplace = podOrder.find((id) => {
          const existingPod = activePods[id];

          return (
            partialPod.parentServiceKey !== existingPod.parentServiceKey &&
            partialPod.name === existingPod.name
          );
        });
        partialPod.shouldReplace = shouldReplace;

        accum[podId] = partialPod;

        return accum;
      },
      {} as ActivePodMap
    );

    setActivePods((old) => Object.assign(old, newActivePodsWithShouldReplace));

    setPodOrder((old) => old.concat(newPodOrder));
    processedServices.current =
      processedServices.current.concat(newProcessedServices);
  }, [services, podStatuses, activePods, podOrder]);

  return (
    <>
      <SimulatorContextLabel>{namespace}</SimulatorContextLabel>
      <StyledRow
        name="NAME"
        ready="READY"
        status="STATUS"
        restarts="RESTARTS"
        containerStyles={{
          borderBottom: "1px solid rgba(111, 111, 111, 0.50)",
        }}
      />

      {podOrder.map((podId) => {
        const { name, shouldReplace, skipStartup } = activePods[podId];

        return (
          <ServiceRow
            key={podId}
            podId={podId}
            shouldReplace={shouldReplace}
            skipStartup={skipStartup}
            name={name}
            onStatusChange={handleStatusChange}
            onRemove={handlePodRemove}
          />
        );
      })}

      {podOrder.length === 0 && (
        <Typography className="text-gray-500 text-center py-4">
          No pods running
        </Typography>
      )}
    </>
  );
};
