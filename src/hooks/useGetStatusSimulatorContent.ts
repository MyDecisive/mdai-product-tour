import { useEffect, useMemo, useRef } from "react";
import type { StatusSimulatorProps } from "../components/Simulators/Status/Status";

export function useGetStatusSimulatorContent({
  activePods,
  podOrder,
  playing,
  activeLogContext = "",
}: Omit<StatusSimulatorProps, "onPodStatusChange">) {
  const serviceContainerRef = useRef<HTMLDivElement | null>(null);

  const servicesToDisplay = useMemo(() => {
    return podOrder.map((podId) => {
      const svc = activePods[podId];

      if (activeLogContext !== "" && podId.startsWith(activeLogContext)) {
        return {
          ...svc,
          isActiveLogsContext: true,
        };
      }

      return svc;
    });
  }, [activePods, podOrder, activeLogContext]);

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
