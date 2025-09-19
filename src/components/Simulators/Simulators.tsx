import { Box, Grid } from "@mui/material";
import { useEffect, useRef } from "react";
import { useGetPanelContent } from "../../hooks/useGetPanelContent";
import { ConfigText } from "./Config";
import { LogsSimulator } from "./Logs";
import { SimulatorBox } from "./SimulatorBox";
import { Status } from "./Status";
import { Terminal } from "./Terminal";

export function Simulators() {
  const {
    inTour,
    panelState: { config, terminal, status, logs },
  } = useGetPanelContent();

  const simContainerParentRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (config?.active || status?.active) {
      if (simContainerParentRef.current) {
        simContainerParentRef.current.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  }, [config?.active, status?.active]);

  useEffect(() => {
    if (terminal?.active || logs?.active) {
      if (simContainerParentRef.current) {
        simContainerParentRef.current.scrollTop =
          simContainerParentRef.current.scrollHeight;
      }
    }
  }, [terminal?.active, logs?.active]);

  return (
    <Box
      sx={{ flexGrow: 1, overflow: "auto", scrollBehavior: "smooth" }}
      ref={simContainerParentRef}
    >
      <Box
        className="simulators-container"
        sx={{
          display: inTour ? "block" : "none",
          flexGrow: 1,
          padding: "24px",
        }}
      >
        {inTour ? (
          <Grid
            container
            rowSpacing={2}
            columnSpacing={{ xs: 1, sm: 2, md: 3 }}
            justifyContent={"space-evenly"}
            alignItems={"stretch"}
            sx={{ width: "100%" }}
          >
            <Grid size={5} sx={{ overflow: "hidden" }}>
              <SimulatorBox
                title="Config"
                link="View Config in GitHub →"
                href={config?.href}
                active={!!config?.active}
              >
                {config !== null && <ConfigText />}
              </SimulatorBox>
            </Grid>

            <Grid size={6.5}>
              <SimulatorBox title="Status" active={!!status?.active}>
                {status !== null && <Status />}
              </SimulatorBox>
            </Grid>

            <Grid size={5}>
              <SimulatorBox
                title="Terminal"
                innerStyles={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "flex-end",
                  boxSizing: "border-box",
                  maxHeight: "394px",
                  height: "394px",
                }}
                active={!!terminal?.active}
              >
                {terminal !== null && <Terminal />}
              </SimulatorBox>
            </Grid>

            <Grid size={6.5}>
              <SimulatorBox
                title="Tail Logs"
                active={!!logs?.active}
                innerStyles={{
                  padding: "24px 14px 16px 14px",
                  boxSizing: "border-box",
                  minHeight: "394px",
                }}
              >
                {logs !== null && <LogsSimulator />}
              </SimulatorBox>
            </Grid>
          </Grid>
        ) : null}
      </Box>
    </Box>
  );
}
