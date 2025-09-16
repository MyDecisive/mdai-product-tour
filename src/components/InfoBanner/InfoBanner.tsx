import { AppBar, Box, Container, Toolbar, Typography } from "@mui/material";
import { useGetInfoBannerContent } from "../../hooks/useGetInfoBannerContent";
import { Bars } from "./Bars";

export function Banner() {
  const {
    percentText,
    received,
    sentToVendor,
    filtered,
    percentFiltered,
    inTour,
    showPercentFiltered,
  } = useGetInfoBannerContent();

  return (
    <AppBar position="static" sx={{ display: inTour ? "block" : "none" }}>
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
          {showPercentFiltered && (
            <Typography variant="h2" sx={{ pr: 1 }} color="primary">
              {percentFiltered}%
            </Typography>
          )}
          <Typography variant="overline" sx={{ p: 0 }}>
            {percentText}
          </Typography>
        </Container>
        <Box
          sx={{
            width: "40%",
          }}
        >
          <Bars title="Logs Received" amount={received} value={received} />
          <Bars title="Sent to Vendor" amount={sentToVendor} value={received} />
          <Bars
            title="Logs Filtered"
            amount={filtered}
            value={received}
            reverse
          />
        </Box>
      </Toolbar>
    </AppBar>
  );
}
