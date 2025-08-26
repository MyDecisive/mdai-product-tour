import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { InfoBox } from "../../components";
import { Logs, PII, Traces } from "../../constants";
import { getViewTitle } from "../../NavDrawer/strings";
import { useCurrentView } from "../../NavigationContext";
import type { ViewTreeItemProps } from "../../types";

function DynamicLogFiltrationContent() {
  const { setView } = useCurrentView();

  return (
    <InfoBox>
      <Typography>
        MDAI offers multiple solutions. Let’s explore{" "}
        <Typography
          component="span"
          sx={{ textDecoration: "underline", display: "inline" }}
        >
          Dynamic Log Filtering
        </Typography>{" "}
        now!
      </Typography>
      <br />
      <Typography>You can learn about it in 3 steps</Typography>
      <br />
      <div style={{ display: "flex", width: "100%", justifyContent: "center" }}>
        <Button size="medium" onClick={() => setView(Logs)}>
          Start the Demo
        </Button>
      </div>
    </InfoBox>
  );
}

export const HomeViewTreeItems: ViewTreeItemProps[] = [
  {
    itemId: Logs,
    label: getViewTitle(Logs),
    content: <DynamicLogFiltrationContent />,
    slotProps: {
      label: {
        style: { textTransform: "uppercase" },
      },
    },
  },
  {
    itemId: Traces,
    label: getViewTitle(Traces),
    content: null,
    slotProps: {
      label: {
        style: { textTransform: "uppercase" },
        subLabel: "Coming soon",
      },
    },
  },
  {
    itemId: PII,
    label: getViewTitle(PII),
    content: null,
    slotProps: {
      label: {
        style: { textTransform: "uppercase" },
        subLabel: "Coming soon",
      },
    },
  },
];
