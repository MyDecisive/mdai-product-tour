import { css } from "@emotion/react";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Typography from "@mui/material/Typography";
import { SubStepContent } from "../../components/SubStepContent";
import { useGetPanelContent } from "../../hooks/useGetPanelContent";
import { Logs } from "../../utils/constants";
import type {
  NavigationState,
  StepItemMap,
  ViewStepOrder,
  ViewTreeItemProps,
} from "../../utils/types";
import { hydrateViewTreeitems, ITEM_IDS } from "../common";

function WhatIs() {
  return (
    <SubStepContent title={"Filtering log data to improve signal"}>
      Stop paying for data you’ll never use. Take control of your observability
      budget by controlling the data stream, while it is still inside your
      network. Send just what you need with the MyDecisive SmartHub.
    </SubStepContent>
  );
}

const ListItemStyles = css({
  padding: 0,
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "flex-start",
});

const BulletStyle = css({
  fontWeight: 700,
  paddingLeft: "4px",
  paddingRight: "4px",
});

function UnifiedView() {
  const { config, terminal, status, logs } = useGetPanelContent();

  return (
    <SubStepContent title="Consolidated tools">
      <Typography>
        Multiple tools, consolidated into a unified view to make it easy for you
        to see how MyDecisive works
      </Typography>
      <List>
        <ListItem sx={ListItemStyles}>
          <Typography sx={BulletStyle}>1.</Typography>
          <Typography>
            <span
              style={{
                fontWeight: 700,
                ...(config?.active && {
                  color: "#000000",
                  backgroundColor: "#B062C2",
                }),
              }}
            >
              Configurations
            </span>{" "}
            Configure, control the SmartHub through its config files.
          </Typography>
        </ListItem>
        <ListItem sx={ListItemStyles}>
          <Typography sx={BulletStyle}>2.</Typography>
          <Typography>
            <span
              style={{
                fontWeight: 700,
                ...(terminal?.active && {
                  color: "#000000",
                  backgroundColor: "#B062C2",
                }),
              }}
            >
              Terminal
            </span>{" "}
            Deploy changes to the SmartHub
          </Typography>
        </ListItem>
        <ListItem sx={ListItemStyles}>
          <Typography sx={BulletStyle}>3.</Typography>
          <Typography>
            <span
              style={{
                fontWeight: 700,
                ...(status?.active && {
                  color: "#000000",
                  backgroundColor: "#B062C2",
                }),
              }}
            >
              Status
            </span>{" "}
            the running SmartHub processes
          </Typography>
        </ListItem>
        <ListItem sx={ListItemStyles}>
          <Typography sx={BulletStyle}>4.</Typography>
          <Typography>
            <span
              style={{
                fontWeight: 700,
                ...(logs?.active && {
                  color: "#000000",
                  backgroundColor: "#B062C2",
                }),
              }}
            >
              Tail logs
            </span>{" "}
            SmartHub logs
          </Typography>
        </ListItem>
      </List>
    </SubStepContent>
  );
}

function DataStarts() {
  return (
    <SubStepContent title="Simulate incoming logs">
      Run this <span style={{ color: "#B062C2" }}>{`<Command>`}</span> to get
      the data flowing. <br />
      <br /> You can see the SmartHub running now in the{" "}
      <span style={{ color: "#B062C2" }}>Status Simulator window</span> <br />
      <br />
      Click <span style={{ color: "#B062C2" }}>See Results</span> to see what
      has changed.
    </SubStepContent>
  );
}

function VisualizeThe() {
  return (
    <SubStepContent title="What are you seeing">
      Some copy explaining what you would normally expect to see
    </SubStepContent>
  );
}

function ConfigureStatus() {
  return (
    <SubStepContent title="We use OpenTelemetry static filters">
      Control your data with open standards that decouple you from your vendors.
      Free, forever. No added cloud vendors or vendor costs.
    </SubStepContent>
  );
}

function TakeNote() {
  return (
    <SubStepContent title="We prepare the data for you">
      <ol style={{ paddingLeft: "24px" }}>
        <li>“mdai_service” is set for you in the data filtration solution</li>
        <li>
          In this example, Service1234 and 4321 are generated service names.
        </li>
      </ol>
    </SubStepContent>
  );
}

function ExploreThe() {
  return (
    <SubStepContent title="OTEL is now running">
      The OTEL collector your configured is now running inside our SmartHub.
      <br />
      And the logs show you are dropping data from service1234 and 4321.
    </SubStepContent>
  );
}

function VisualizeThe2() {
  return (
    <SubStepContent title="Saving Money but...">
      You can see from our dashboards that data is filtered effectively. But now
      Service1234 and 4321 are missing from your vendors. Let’s do better.
    </SubStepContent>
  );
}

function AddA() {
  return (
    <SubStepContent title="Variables make data streams smart">
      Click the <span style={{ color: "#B062C2" }}>{`<Command>`}</span> to add a
      variable
    </SubStepContent>
  );
}

function TakeNote2() {
  return (
    <SubStepContent title="Label">
      <ol style={{ paddingLeft: "24px" }}>
        <li>
          “top loggers” are services that log more than your budget can handle.
          The name of the variable is “Service_list”
        </li>
        <li>
          Your code only needs to reference the variable named “service_list”.
          We compute them for you automatically.
        </li>
        <li>
          The “service_list” behavior is managed by configuration as well. Learn
          more here.
        </li>
      </ol>
    </SubStepContent>
  );
}

export const stepItemsMap: StepItemMap = {
  [ITEM_IDS.introduction]: {
    label: "Introduction",
  },
  [ITEM_IDS.step1]: {
    label: "Step 1: Get the data flowing",
  },
  [ITEM_IDS.step2]: {
    label: "Step 2: Drop unwanted data",
  },
  [ITEM_IDS.step3]: {
    label: "Step 3: Let the system help you",
  },

  [ITEM_IDS.introduction_what]: {
    label: "What is Dynamic log Filtering",
    content: <WhatIs />,
  },
  [ITEM_IDS.introduction_unified]: {
    label: "Unified View For Easier Understanding",
    content: <UnifiedView />,
  },
  [ITEM_IDS.step1_data]: {
    label: "Data Starts to Flow",
    content: <DataStarts />,
  },
  [ITEM_IDS.step1_visualize]: {
    label: "Visualize The Results",
    content: <VisualizeThe />,
  },
  [ITEM_IDS.step2_configure]: {
    label: "Configure static filters",
    content: <ConfigureStatus />,
  },
  [ITEM_IDS.step2_take]: {
    label: "Take Note",
    content: <TakeNote />,
  },
  [ITEM_IDS.step2_explore]: {
    label: "Explore the running system",
    content: <ExploreThe />,
  },
  [ITEM_IDS.step2_visualize]: {
    label: "Visualize The Results",
    content: <VisualizeThe2 />,
  },
  [ITEM_IDS.step3_add]: {
    label: "Add a variable",
    content: <AddA />,
  },
  [ITEM_IDS.step3_take]: {
    label: "Take Note",
    content: <TakeNote2 />,
  },
  [ITEM_IDS.step3_vizualize]: {
    label: "Vizualize The Results",
    content: <div></div>,
  },
};

export const STEP_ORDER: ViewStepOrder = [
  {
    stepId: ITEM_IDS.introduction,
    subStepIds: [ITEM_IDS.introduction_what, ITEM_IDS.introduction_unified],
  },
  {
    stepId: ITEM_IDS.step1,
    subStepIds: [ITEM_IDS.step1_data, ITEM_IDS.step1_visualize],
  },
  {
    stepId: ITEM_IDS.step2,
    subStepIds: [
      ITEM_IDS.step2_configure,
      ITEM_IDS.step2_take,
      ITEM_IDS.step2_explore,
      ITEM_IDS.step2_visualize,
    ],
  },
  {
    stepId: ITEM_IDS.step3,
    subStepIds: [
      ITEM_IDS.step3_add,
      ITEM_IDS.step3_take,
      ITEM_IDS.step3_vizualize,
    ],
  },
];

export const viewTreeitems: ViewTreeItemProps[] = hydrateViewTreeitems(
  stepItemsMap,
  STEP_ORDER
);

export const logs_default_steps: NavigationState = {
  view: Logs,
  step: "introduction",
  subStep: "introduction_what",
};
