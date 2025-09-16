import { useMemo } from "react";
import { selectInTour, selectPanelState } from "../contexts/selectors";
import { useSelector } from "./useSelector";

export function useGetInfoBannerContent() {
  const { banner } = useSelector(selectPanelState);
  const inTour = useSelector(selectInTour);

  const { percentText, showPercentFiltered, logs = {} } = banner || {};

  const { sentToVendor, filtered } = logs as {
    sentToVendor: number;
    filtered: number;
  };

  const received = useMemo(() => {
    return Math.round((sentToVendor + filtered) * 100) / 100;
  }, [sentToVendor, filtered]);
  const percentFiltered = useMemo(() => {
    return received > 0 ? Math.round((filtered / received) * 100) : 0;
  }, [received, filtered]);

  return {
    percentText,
    received,
    sentToVendor,
    filtered,
    showPercentFiltered,
    percentFiltered,
    inTour,
  };
}
