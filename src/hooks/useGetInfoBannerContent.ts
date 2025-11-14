import { useMemo } from "react";
import { useDemoContext } from "./useDemoContext";

export function useGetInfoBannerContent() {
  const {
    engineState,
    navigationState: { tour },
  } = useDemoContext();

  const inTour = tour !== "";

  const { text, logsSent, logsFiltered } = engineState.currentSimulatorState
    .banner || {
    logsSent: 0,
    logsFiltered: 0,
    text: "",
  };

  const received = useMemo(() => {
    return Math.round((logsSent + logsFiltered) * 100) / 100;
  }, [logsSent, logsFiltered]);
  const percentFiltered = useMemo(() => {
    return received > 0 ? Math.round((logsFiltered / received) * 100) : 0;
  }, [received, logsFiltered]);

  const showPercentFiltered = logsSent !== 0;

  return {
    text,
    received,
    logsSent,
    logsFiltered,
    showPercentFiltered,
    percentFiltered,
    inTour,
  };
}
