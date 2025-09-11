import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { STATUS } from "../components/Simulators/Status/constants";
import type {
  PodId,
  StatusString,
} from "../components/Simulators/Status/types";
import { selectAnimationIndex, selectPanelState } from "../contexts/selectors";
import type { Service, StatusProps } from "../utils/types";
import { useHighlander } from "./useHighlander";
import { useSelector } from "./useSelector";

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
  id: PodId;
  name: string;
  status: StatusString;
  skipStartup?: boolean;
  replicaNo: number;
  parentServiceKey: string;
  beingReplaced?: boolean;
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
          id: newPodId,
          name: service.name,
          status: service.skipStartup ? STATUS.running : STATUS.pending,
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

export function useGetStatusSimulatorContent() {
  const { status = {} } = useSelector(selectPanelState);
  const animationIndex = useSelector(selectAnimationIndex);
  const { actions } = useHighlander();

  const { services = [], contextLabel = "" } = status as StatusProps;

  const [podOrder, setPodOrder] = useState<PodId[]>([]);
  const [activePods, setActivePods] = useState<ActivePodMap>({});
  const processedServices = useRef<string[]>([]);

  const handleStatusChange = useCallback((podId: string, status: string) => {
    setActivePods((prev) => ({ ...prev, [podId]: { ...prev[podId], status } }));
  }, []);

  const handlePodRemove = useCallback((podId: string) => {
    setActivePods((prev) => {
      const newStatuses = { ...prev };
      delete newStatuses[podId];
      return newStatuses;
    });
    setPodOrder((old) => old.filter((id) => id !== podId));
  }, []);

  useEffect(() => {
    const pods = Object.values(activePods).filter((pod) => !pod.skipStartup);
    const allStabilized =
      pods.length > 0 && pods.every((pod) => pod.status === "Running");

    if (allStabilized) {
      actions.INCREMENT_ANIMATION();
    }
  }, [activePods, actions]);

  useEffect(() => {
    // NOTE: The code below expects `services` to _always_ grow

    // TODO: Handle `services` being smaller (new array). -- Is that a thing that needs to be accounted for?
    const newServices = services.filter((service, idx) => {
      const key = createServiceKey(service, idx);
      return !processedServices.current.includes(key);
    });

    if (newServices.length === 0) return;

    const { newPodOrder, newActivePods, newProcessedServices } =
      servicesToActivePods(newServices);

    const toBeReplaced: string[] = [];
    newPodOrder.forEach((podId) => {
      const partialPod = newActivePods[podId];

      const shouldReplace = podOrder.find((id) => {
        const existingPod = activePods[id];

        return (
          partialPod.parentServiceKey !== existingPod.parentServiceKey &&
          partialPod.name === existingPod.name &&
          !toBeReplaced.includes(id)
        );
      });

      if (shouldReplace) toBeReplaced.push(shouldReplace);
    });

    setActivePods((old) => {
      const newActivePodMap = Object.assign(old, newActivePods);
      toBeReplaced.forEach((id) => (newActivePodMap[id].beingReplaced = true));

      return newActivePodMap;
    });

    setPodOrder((old) => old.concat(newPodOrder));
    processedServices.current =
      processedServices.current.concat(newProcessedServices);
  }, [services, activePods, podOrder]);

  const servicesToDisplay = useMemo(() => {
    return podOrder.map((podId) => activePods[podId]);
  }, [activePods, podOrder]);

  useEffect(() => {
    if (animationIndex === -1) {
      setPodOrder([]);
      setActivePods({});
      processedServices.current = [];
    }
  }, [animationIndex]);

  return {
    services: servicesToDisplay,
    contextLabel,
    handlePodRemove,
    handleStatusChange,
    incrementAnimation: actions.INCREMENT_ANIMATION,
  };
}
