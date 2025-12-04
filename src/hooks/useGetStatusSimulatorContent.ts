import { useEffect, useMemo, useRef } from "react";
import type { StatusSimulatorProps } from "../components/Simulators/Status/Status";

export function useGetStatusSimulatorContent({
  activePods,
  podOrder,
  playing,
}: Omit<StatusSimulatorProps, "onPodStatusChange">) {
  const serviceContainerRef = useRef<HTMLDivElement | null>(null);

  const servicesToDisplay = useMemo(() => {
    return podOrder.map((podId) => activePods[podId]);
  }, [activePods, podOrder]);

  useEffect(() => {
    if (playing && serviceContainerRef.current) {
      serviceContainerRef.current.scrollTop =
        serviceContainerRef.current.scrollHeight;
    }
  }, [podOrder.length, activePods, playing]);

  return {
    services: servicesToDisplay,
    serviceContainerRef,
  };
}
