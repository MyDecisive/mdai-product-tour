import { AppBar, Box, Container, Toolbar, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { selectNavigation } from "../../contexts/selectors";
import { useSelector } from "../../hooks/useSelector";
import type { InfoBannerProps } from "../../utils/types";
import {
  BANNER_BY_STEP,
  initialBannerState,
} from "../../views/Logs/bannerContent";
import { Bars } from "./Bars";

export function Banner() {
  const { view, subStep } = useSelector(selectNavigation);
  const [bannerInfo, setBannerInfo] =
    useState<InfoBannerProps>(initialBannerState);
  const received =
    Math.round(
      (bannerInfo.logs.sentToVendor + bannerInfo.logs.filtered) * 100
    ) / 100;
  const percentFiltered =
    received > 0 ? Math.round((bannerInfo.logs.filtered / received) * 100) : 0;

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
          {!!bannerInfo.percentFiltered && (
            <Typography variant="h2" sx={{ pr: 1 }} color="primary">
              {percentFiltered}%
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
          <Bars title="Logs Received" amount={received} value={received} />
          <Bars
            title="Sent to Vendor"
            amount={bannerInfo.logs.sentToVendor}
            value={received}
          />
          <Bars
            title="Logs Filtered"
            amount={bannerInfo.logs.filtered}
            value={received}
            reverse
          />
        </Box>
      </Toolbar>
    </AppBar>
  );
}
