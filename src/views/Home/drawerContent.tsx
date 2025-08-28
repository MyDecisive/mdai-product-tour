import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { InfoBox } from "../../components/InfoBox";
import { useNavigation } from "../../hooks/useNavigation";
import { Logs, PII, Traces } from "../../utils/constants";
import { getViewTitle } from "../../utils/strings";
import type {
  StepItemMap,
  ViewStepOrder,
  ViewTreeItemProps,
} from "../../utils/types";
import { logs_default_steps } from "../Logs/drawerContent";
import { hydrateViewTreeitems, ITEM_IDS } from "../common";

function DynamicLogFiltrationContent() {
  const { setNavigation } = useNavigation();

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
        <Button size="medium" onClick={() => setNavigation(logs_default_steps)}>
          Start the Demo
        </Button>
      </div>
    </InfoBox>
  );
}

export const stepItemsMap: StepItemMap = {
  [ITEM_IDS.Logs]: {
    label: getViewTitle(Logs),
    content: <DynamicLogFiltrationContent />,
    slotProps: {
      label: {
        style: { textTransform: "uppercase" },
      },
    },
  },
  [ITEM_IDS.Traces]: {
    label: getViewTitle(Traces),
    content: null,
    slotProps: {
      label: {
        style: { textTransform: "uppercase" },
        subLabel: "Coming soon",
      },
    },
  },
  [ITEM_IDS.PII]: {
    label: getViewTitle(PII),
    content: null,
    slotProps: {
      label: {
        style: { textTransform: "uppercase" },
        subLabel: "Coming soon",
      },
    },
  },
};

export const STEP_ORDER: ViewStepOrder = [
  {
    stepId: ITEM_IDS.Logs,
  },
  {
    stepId: ITEM_IDS.Traces,
  },
  {
    stepId: ITEM_IDS.PII,
  },
];

export const viewTreeItems: ViewTreeItemProps[] = hydrateViewTreeitems(
  stepItemsMap,
  STEP_ORDER
);
