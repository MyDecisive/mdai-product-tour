import { AppBar, Box, Container, Toolbar, Typography } from "@mui/material";
import { useGetInfoBannerContent } from "../../hooks/useGetInfoBannerContent";
import { Bars } from "./Bars";

export function Banner() {
  const {
    text,
    received,
    logsSent,
    logsFiltered,
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
        {text !== "" && (
          <>
            <Container
              sx={{
                display: "flex",
                m: 0,
                width: "55%",
                justifyContent: "flex-start",
                alignItems: "center",
                px: { md: "0 !important" },
              }}
            >
              {showPercentFiltered && (
                <Typography
                  variant={"h2"}
                  sx={{ pr: 1, fontSize: { md: "2rem" } }}
                  color="primary"
                >
                  {percentFiltered}%
                </Typography>
              )}
              <Typography variant="overline" sx={{ p: 0 }}>
                {text}
              </Typography>
            </Container>
            <Box
              sx={{
                width: { xl: "40%", lg: "60%", md: "85%" },
              }}
            >
              <Bars title="Logs Received" amount={received} value={received} />
              <Bars title="Sent to Vendor" amount={logsSent} value={received} />
              <Bars
                title="Logs Filtered"
                amount={logsFiltered}
                value={received}
                reverse
              />
            </Box>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
}
