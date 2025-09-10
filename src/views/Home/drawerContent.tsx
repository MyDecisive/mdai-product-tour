import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { InfoBox } from "../../components/InfoBox";
import { useNavigation } from "../../hooks/useNavigation";
import {
  ITEM_IDS,
  Logs,
  LOGS_DEFAULT_STEPS,
  PII,
  Traces,
} from "../../utils/constants";
import { getViewTitle } from "../../utils/strings";
import type {
  StepItemMap,
  ViewStepOrder,
  ViewTreeItemProps,
} from "../../utils/types";
import { hydrateViewTreeitems } from "../common";

function DynamicLogFiltrationContent() {
  const { setNavigation } = useNavigation();

  return (
    <InfoBox>
      <Typography>Ready to see how it works?</Typography>
      <br />
      <div style={{ display: "flex", width: "100%", justifyContent: "center" }}>
        <Button size="medium" onClick={() => setNavigation(LOGS_DEFAULT_STEPS)}>
          Fire it up
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
