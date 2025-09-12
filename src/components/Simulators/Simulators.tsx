import { Box, Grid } from "@mui/material";
import { useGetPanelContent } from "../../hooks/useGetPanelContent";
import { useNavigation } from "../../hooks/useNavigation";
import { Home } from "../../utils/constants";
import { ConfigText } from "./Config";
import { LogsSimulator } from "./Logs";
import { SimulatorBox } from "./SimulatorBox";
import { Status } from "./Status";
import { Terminal } from "./Terminal";
import logsView from "../../assets/logs.gif";
import postfilter from "../../assets/post-filter.gif";


export function Simulators() {
  const { view, subStep } = useNavigation();
  const { config, terminal, status, logs } = useGetPanelContent();
  const visualizations = subStep === "step1_results" ? (
    <img src={logsView} alt="Logs Visualization" style={{ width: "100%", aspectRatio: 1/1 }} />
  ) : subStep === "step2_visualize" ? (
    <img src={postfilter} alt="Prefilter Visualization" style={{ width: "100%", aspectRatio: 1/1 }} />
  ) : subStep === "step3_visualize" ? (
    <img src={postfilter} alt="Postfilter Visualization" style={{ width: "100%", aspectRatio: 1/1 }} />
  ) : null;

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        display: view === Home ? "none" : "block",
      }}
    >
      
        {(subStep === "step1_results") || (subStep === "step2_visualize") || (subStep === "step3_visualize") ? (
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
              {config !== null && (
                <ConfigText
                  text={config.text}
                  activeRange={config.activeRange}
                  title={config.title}
                />
              )}
            </SimulatorBox>
          </Grid>

          <Grid size={6.5}>
            <SimulatorBox title="Status" active={!!status?.active}>
              {status !== null && (
                <Status
                  services={status.services}
                  namespace={status.namespace}
                />
              )}
            </SimulatorBox>
          </Grid>

          <Grid size={5}>
            <SimulatorBox
              title="Terminal"
              innerStyles={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-end",
              }}
              active={!!terminal?.active}
            >
              {terminal !== null && (
                <Terminal
                  typedOptions={terminal.typedOptions}
                  contextLabel={terminal.contextLabel}
                />
              )}
            </SimulatorBox>
          </Grid>

          <Grid size={6.5}>
            <SimulatorBox title="Tail Logs" active={!!logs?.active}>
              {logs !== null && (
                <LogsSimulator
                  logRecords={logs.logRecords}
                  speed={logs.speed}
                  errorLogs={logs.errorLogs}
                  errorFrequency={logs.errorFrequency}
                  isPaused={logs.isPaused}
                  contextLabel={logs.contextLabel}
                />
              )}
            </SimulatorBox>
          </Grid>
        </Grid>
      )}

    </Box>
  );
}
