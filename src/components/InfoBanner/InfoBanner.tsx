import { useState, useEffect } from "react";
import { useNavigation } from "../../hooks/useNavigation";
import { AppBar, Box, Container, Toolbar, Typography } from "@mui/material";
import { Bars } from "./Bars";
import type { InfoBannerProps } from "../../utils/types";
import {
  BANNER_BY_STEP,
  initialBannerState,
} from "../../views/Logs/bannerContent";

export function Banner() {
  const { view, subStep } = useNavigation();
  const [bannerInfo, setBannerInfo] = useState<InfoBannerProps>(initialBannerState);

  useEffect(() => {
    if (!subStep) {
      setBannerInfo(initialBannerState);
      return;
    }
    const next = BANNER_BY_STEP[subStep];
    if (next) {
      setBannerInfo(next);
    }
  }, [subStep]);

  return (
    <AppBar
      position="static"
      sx={{ display: view === "Home" ? "none" : "block" }}
    >
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
          {bannerInfo.percentFiltered !== null && (
            <Typography variant="h2" sx={{ pr: 1 }} color="primary">
              {bannerInfo.percentFiltered}%
            </Typography>
          )}
          <Typography variant="overline" sx={{ p: 0 }}>
            {bannerInfo.percentText}
          </Typography>
        </Container>
        <Box
          sx={{
            width: "40%",
          }}
        >
          <Bars
            title="Logs Received"
            amount={bannerInfo.logs.received}
            value={bannerInfo.logs.received}
          />
          <Bars
            title="Sent to Vendor"
            amount={bannerInfo.logs.sentToVendor}
            value={bannerInfo.logs.received}
          />
          <Bars
            title="Logs Filtered"
            amount={bannerInfo.logs.filtered}
            value={bannerInfo.logs.received}
            reverse
          />
        </Box>
      </Toolbar>
    </AppBar>
  );
}
