import { Box, Grid } from "@mui/material";
import { useGetPanelContent } from "../../hooks/useGetPanelContent";
import { ConfigText } from "./Config";
import { LogsSimulator } from "./Logs";
import { SimulatorBox } from "./SimulatorBox";
import { Status } from "./Status";
import { Terminal } from "./Terminal";
import logsView from "../../assets/logs.gif";
import postfilter from "../../assets/post-filter.gif";
import { useSelector } from "../../hooks/useSelector";
import { selectNavigation } from "../../contexts/selectors";


export function Simulators() {
  const { subStep } = useSelector(selectNavigation);
  const visualizations = subStep === "step1_results" ? (
    <img src={logsView} alt="Logs Visualization" style={{ width: "100%", maxWidth: "900px", aspectRatio: "1/1" }} />
  ) : subStep === "step2_visualize" ? (
    <img src={postfilter} alt="Prefilter Visualization" style={{ width: "100%", maxWidth: "900px", aspectRatio: "1.25/1" }} />
  ) : subStep === "step3_visualize" ? (
    <img src={postfilter} alt="Postfilter Visualization" style={{ width: "100%", maxWidth: "900px", aspectRatio: "1.25/1" }} />
  ) : null;
  const {
    inTour,
    panelState: { config, terminal, status, logs },
  } = useGetPanelContent();

  return (
    <Box
      className="simulators-container"
      sx={{
        display: inTour ? "block" : "none",
        flexGrow: 1,
        padding: "24px",
      }}
    >
      {inTour ? (  
        (subStep === "step1_results") || (subStep === "step2_visualize") || (subStep === "step3_visualize") ? (
          visualizations
        ) : (
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
        )
      ) : null}
    </Box>
  );
}
