import type { InfoBannerProps } from "../../utils/types";

export const initialBannerState: InfoBannerProps = {
  percentText: "Start log filtration to see results",
  showPercentFiltered: false,
  logs: { sentToVendor: 0, filtered: 0 },
};

export const filterOff: InfoBannerProps = {
  percentText: "of log data filtered",
  showPercentFiltered: true,
  logs: { sentToVendor: 28.5, filtered: 0 },
};

export const filterOn: InfoBannerProps = {
  percentText: "of log data filtered",
  showPercentFiltered: true,
  logs: { sentToVendor: 3.99, filtered: 24.51 },
};

export const dynamicFilterOn: InfoBannerProps = {
  percentText: "of log data filtered",
  showPercentFiltered: true,
  logs: { sentToVendor: 18.525, filtered: 9.975 },
};