import { ITEM_IDS } from "../../utils/constants";
import type { InfoBannerProps } from "../../utils/types";

export const initialBannerState: InfoBannerProps = {
  percentText: "Start log filtration to see results",
  percentFiltered: null,
  logs: { received: 0, sentToVendor: 0, filtered: 0 },
};

const filterOff: InfoBannerProps = {
  percentText: "of log data filtered",
  percentFiltered: 0,
  logs: { received: 4.3, sentToVendor: 4.3, filtered: 0 },
};

const filterOn: InfoBannerProps = {
  percentText: "of log data filtered",
  percentFiltered: 89,
  logs: { received: 12.1, sentToVendor: 1.39, filtered: 10.71 },
};

export const BANNER_BY_STEP: Record<string, InfoBannerProps> = {
  [ITEM_IDS.introduction_meet]: initialBannerState,
  [ITEM_IDS.introduction_guide]: initialBannerState,
  [ITEM_IDS.introduction_consolidated]: initialBannerState,
  [ITEM_IDS.step1_data]: initialBannerState,
  [ITEM_IDS.step1_results]: filterOff,
  [ITEM_IDS.step2_take]: filterOn,
  [ITEM_IDS.step2_visualize]: filterOn,
};
