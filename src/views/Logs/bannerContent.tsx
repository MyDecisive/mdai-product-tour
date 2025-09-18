import { ITEM_IDS } from "../../utils/constants";
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
  logs: { sentToVendor: 4.23, filtered: 26.92 },
};

export const dynamicFilterOn: InfoBannerProps = {
  percentText: "of log data filtered",
  showPercentFiltered: true,
  logs: { sentToVendor: 10.4, filtered: 26.92 },
};

export const BANNER_BY_STEP: Record<string, InfoBannerProps> = {
  [ITEM_IDS.introduction_meet]: initialBannerState,
  [ITEM_IDS.introduction_guide]: initialBannerState,
  [ITEM_IDS.introduction_consolidated]: initialBannerState,
  [ITEM_IDS.step1_data]: initialBannerState,
  [ITEM_IDS.step1_results]: filterOff,
  [ITEM_IDS.step2_take]: filterOn,
  [ITEM_IDS.step2_visualize]: filterOn,
  [ITEM_IDS.step3_take]: dynamicFilterOn,
};
