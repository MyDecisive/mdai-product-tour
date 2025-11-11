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
  namespace: string;
  status: StatusString;
  skipStartup?: boolean;
  replicaNo: number;
  parentServiceKey: string;
  beingReplaced?: boolean;
  replacing?: PodId;
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
          namespace: service.namespace,
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
  const { status = {}, isShowingPreviousContent } =
    useSelector(selectPanelState);
  const animationIndex = useSelector(selectAnimationIndex);
  const { actions } = useHighlander();

  const { services = [], contextLabel = "" } = status as StatusProps;

  const [podOrder, setPodOrder] = useState<PodId[]>([]);
  const [activePods, setActivePods] = useState<ActivePodMap>({});
  const processedServices = useRef<string[]>([]);
  const serviceContainerRef = useRef<HTMLDivElement | null>(null);
  const [workingContext, setWorkingContext] = useState<string>(contextLabel);
  const [workDone, setWorkDone] = useState<boolean>(false);

  const memoizedServices = useMemo(() => {
    return services;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    services.length,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    services
      .map((s) => `${s.name}-${s.replicas}-${s.skipStartup}-${s.noSuffix}`)
      .join(","),
  ]);

  const handleStatusChange = useCallback((podId: string, status: string) => {
    setActivePods((prev) => {
      const prevPod = prev[podId];
      const nextActivePods = { ...prev, [podId]: { ...prevPod, status } };
      if (
        prevPod.replacing &&
        status === STATUS.running &&
        nextActivePods[prevPod.replacing]
      ) {
        nextActivePods[prevPod.replacing] = {
          ...nextActivePods[prevPod.replacing],
          beingReplaced: true,
          status: STATUS.terminating,
        };
      }
      return nextActivePods;
    });
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
    const pods = Object.values(activePods);
    const allStabilized =
      pods.length > 0 &&
      pods.every((pod) => pod.status === "Running" && !pod.beingReplaced);
    if (allStabilized && !isShowingPreviousContent) {
      setWorkDone(true);
      actions.INCREMENT_ANIMATION();
    }
  }, [activePods, actions, isShowingPreviousContent]);

  useEffect(() => {
    // NOTE: The code below expects `services` to _always_ grow

    // TODO: Handle `services` being smaller (new array). -- Is that a thing that needs to be accounted for?
    const newServices = memoizedServices.filter((service, idx) => {
      const key = createServiceKey(service, idx);
      return !processedServices.current.includes(key);
    });

    if (newServices.length === 0 || isShowingPreviousContent) return;
    setWorkDone(false);
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

      if (shouldReplace) {
        toBeReplaced.push(shouldReplace);
        partialPod.replacing = shouldReplace;
      }
    });

    setActivePods((old) => {
      const newActivePodMap = Object.assign(old, newActivePods);

      return newActivePodMap;
    });

    setPodOrder((old) => old.concat(newPodOrder));
    processedServices.current =
      processedServices.current.concat(newProcessedServices);
  }, [memoizedServices, activePods, podOrder, isShowingPreviousContent]);

  const servicesToDisplay = useMemo(() => {
    return podOrder.map((podId) => activePods[podId]);
  }, [activePods, podOrder]);

  useEffect(() => {
    if (
      (animationIndex === -1 || contextLabel !== workingContext) &&
      !isShowingPreviousContent
    ) {
      setPodOrder([]);
      setActivePods({});
      processedServices.current = [];
      setWorkingContext(contextLabel);
      setWorkDone(false);
    }
  }, [animationIndex, contextLabel, workingContext, isShowingPreviousContent]);

  useEffect(() => {
    if (!workDone && serviceContainerRef.current) {
      serviceContainerRef.current.scrollTop =
        serviceContainerRef.current.scrollHeight;
    }
  }, [podOrder.length, activePods, workDone]);

  return {
    services: servicesToDisplay,
    contextLabel,
    handlePodRemove,
    handleStatusChange,
    serviceContainerRef,
  };
}
