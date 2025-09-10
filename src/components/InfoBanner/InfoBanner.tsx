import { useState, useEffect } from "react";
import { useNavigation } from "../../hooks/useNavigation";
import { AppBar, Box, Container, Toolbar, Typography } from "@mui/material";
import { Bars } from "./Bars";

type InfoBannerProps = {
  percentText?: string;
  percentFiltered?: number | null;
  value?: number;
  logsReceived?: number;
  sentToVendor?: number;
  logsFiltered?: number;
};

const initialBannerState: InfoBannerProps = {
  percentText: "Start log filtration to see results",
  percentFiltered: null,
  value: 0,
  logsReceived: 0,
  sentToVendor: 0,
  logsFiltered: 0,
};

export function Banner() {
  const { view, subStep } = useNavigation();
  const [bannerInfo, setBannerInfo] = useState<InfoBannerProps>(initialBannerState);
  
  useEffect(() => {
    const noFilterSteps = ["step1_results", "step2_configure"];
    const filterSteps = ["step2_take", "step2_explore", "step2_visualize", "step3_add", "step3_take", "step3_visualize"];
    if (subStep && noFilterSteps.includes(subStep)) {
      setBannerInfo({
        percentText: "of log data filtered",
        percentFiltered: 0,
        value: 4.3,
        logsReceived: 4.3,
        sentToVendor: 4.3,
        logsFiltered: 0,
      });
    } else if (subStep && filterSteps.includes(subStep)) {
      setBannerInfo({
        percentText: "of log data filtered",
        percentFiltered: 89,
        value: 12.1,
        logsReceived: 12.1,
        sentToVendor: 1.4,
        logsFiltered: 10.7,
      });
    }}, [subStep]);

  return (
    <AppBar position="static" sx={{ display: view === "Home" ? "none" : "block" }}>
      <Toolbar
        sx={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Container
          sx={{
            display: "flex",
            m: 0,
            width: "55%",
            justifyContent: "flex-start",
            alignItems: "center",
          }}
        >
        {bannerInfo.percentFiltered !== null &&
          <Typography
          variant="h2"
          sx={{ pr: 1 }}
          color="primary"
        >
          {bannerInfo.percentFiltered}%
        </Typography>
        }
        <Typography variant="overline" sx={{ p: 0 }}>
          {bannerInfo.percentText}
        </Typography>
        </Container>
        <Box
          sx={{
            width: "40%",
          }}
        >
          <Bars title="Logs Received" amount={bannerInfo.logsReceived} value={bannerInfo.logsReceived} />
          <Bars title="Sent to Vendor" amount={bannerInfo.sentToVendor} value={bannerInfo.logsReceived} />
          <Bars title="Logs Filtered" amount={bannerInfo.logsFiltered} value={bannerInfo.logsReceived} />
        </Box>
      </Toolbar>
    </AppBar>
  );
}
