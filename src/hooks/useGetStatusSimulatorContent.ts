import { useEffect, useMemo, useRef, useState } from "react";
import type { StatusSimulatorProps } from "../components/Simulators/Status/Status";
import { SIMULATORS } from "../utils/constants";

export function useGetStatusSimulatorContent({
  activePods,
  podOrder,
  onAnimationComplete,
}: Omit<StatusSimulatorProps, "onPodStatusChange">) {
  const serviceContainerRef = useRef<HTMLDivElement | null>(null);
  const [workDone, setWorkDone] = useState<boolean>(false);

  useEffect(() => {
    const pods = Object.values(activePods);
    const allStabilized =
      pods.length > 0 && pods.every((pod) => pod.status === "Running");
    if (allStabilized && !workDone) {
      setWorkDone(true);
      onAnimationComplete(SIMULATORS.STATUS);
    }
  }, [activePods, onAnimationComplete, workDone]);

  const servicesToDisplay = useMemo(() => {
    return podOrder.map((podId) => activePods[podId]);
  }, [activePods, podOrder]);

  useEffect(() => {
    if (!workDone && serviceContainerRef.current) {
      serviceContainerRef.current.scrollTop =
        serviceContainerRef.current.scrollHeight;
    }
  }, [podOrder.length, activePods, workDone]);

  return {
    services: servicesToDisplay,
    serviceContainerRef,
  };
}
