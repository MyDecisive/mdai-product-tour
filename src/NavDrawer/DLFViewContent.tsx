import { css } from "@emotion/react";
import Button from "@mui/material/Button";
import { TreeItem } from "@mui/x-tree-view/TreeItem";
import { Fragment } from "react/jsx-runtime";

import { InfoBox } from "./InfoBox";
import {
  NavTreeItemStyles,
  NavTreeItemTourStyles,
  NavTreeSubStepStyles,
  PrimaryCTAButtonStyles,
} from "./styles";

type DLFViewContentProps = {};

export function DLFViewContent({}: DLFViewContentProps) {
  return [
    {
      itemId: "introduction",
      label: "INTRODUCTION",
      subSteps: [
        {
          itemId: "what",
          label: "What is Dynamic log Filtering",
          content: (
            <Fragment>
              <InfoBox highlight>Filtering log data to improve signal</InfoBox>
              <InfoBox>
                Stop paying for data you’ll never use. Take control of your
                observability budget by controlling the data stream, while it is
                still inside your network. Send just what you need with the
                MyDecisive SmartHub.
              </InfoBox>
            </Fragment>
          ),
        },
        {
          itemId: "unified",
          label: "Unified View For Easier Understanding",
          content: (
            <Fragment>
              <InfoBox highlight>Consolidated tools</InfoBox>
              <InfoBox>
                Multiple tools, consolidated into a unified view to make it easy
                for you to see how MyDecisive works
                <ol style={{ paddingLeft: "24px" }}>
                  <li style={{ fontWeight: 600 }}>
                    <span style={{ fontWeight: 600 }}>IDE Simulator:</span>{" "}
                    Configure, control the SmartHub thru its config files.
                  </li>
                  <li style={{ fontWeight: 600 }}>
                    <span style={{ fontWeight: 600 }}>Terminal Simulator:</span>{" "}
                    Deploy changes to the SmartHub
                  </li>
                  <li style={{ fontWeight: 600 }}>
                    <span style={{ fontWeight: 600 }}>Status Simulator:</span>{" "}
                    the running SmartHub processes
                  </li>
                  <li style={{ fontWeight: 600 }}>
                    <span style={{ fontWeight: 600 }}>
                      Tail logs Simulator:
                    </span>{" "}
                    SmartHub logs
                  </li>
                </ol>
              </InfoBox>
            </Fragment>
          ),
        },
      ],
    },
    {
      itemId: "step1",
      label: "STEP 1: GET DATA FLOWING",
      subSteps: [
        {
          itemId: "data",
          label: "Data Starts to Flow",
          content: (
            <Fragment>
              <InfoBox highlight>Use our built-in log stream generator</InfoBox>
              <InfoBox>
                Run this <span style={{ color: "#B062C2" }}>{`<Command>`}</span>{" "}
                to get the data flowing. <br />
                <br /> You can see the SmartHub running now in the{" "}
                <span style={{ color: "#B062C2" }}>
                  Status Simulator window
                </span>{" "}
                <br />
                <br />
                Click <span style={{ color: "#B062C2" }}>See Results</span> to
                see what has changed.
              </InfoBox>
              <Button sx={css([PrimaryCTAButtonStyles, { marginTop: "24px" }])}>
                Next Step
              </Button>
            </Fragment>
          ),
        },
      ],
    },
    {
      itemId: "step2",
      label: "STEP 2: DROP UNWANTED DATA",
      subSteps: [
        {
          itemId: "configure",
          label: "Configure static filters",
          content: (
            <Fragment>
              <InfoBox highlight>We use OpenTelemetry static filters</InfoBox>
              <InfoBox>
                Control your data with open standards that decouple you from
                your vendors. Free, forever. No added cloud vendors or vendor
                costs.
              </InfoBox>
            </Fragment>
          ),
        },
        {
          itemId: "take",
          label: "Take Note",
          content: (
            <Fragment>
              <InfoBox highlight>We prepare the data for you</InfoBox>
              <InfoBox>
                <ol style={{ paddingLeft: "24px" }}>
                  <li>
                    “mdai_service” is set for you in the data filtration
                    solution
                  </li>
                  <li>
                    In this example, Service1234 and 4321 are generated service
                    names.
                  </li>
                </ol>
              </InfoBox>
            </Fragment>
          ),
        },
        {
          itemId: "explore",
          label: "Explore the running system",
          content: (
            <Fragment>
              <InfoBox highlight>OTEL is now running</InfoBox>
              <InfoBox>
                The OTEL collector your configured is now running inside our
                SmartHub.
                <br />
                And the logs show you are dropping data from service1234 and
                4321.
              </InfoBox>
            </Fragment>
          ),
        },
        {
          itemId: "visualize",
          label: "Visualize The Results",
          content: (
            <Fragment>
              <InfoBox highlight>Saving Money but...</InfoBox>
              <InfoBox>
                You can see from our dashboards that data is filtered
                effectively. But now Service1234 and 4321 are missing from your
                vendors. Let’s do better.
              </InfoBox>
            </Fragment>
          ),
        },
      ],
    },
    {
      itemId: "step3",
      label: "STEP 3: LET THE SYSTEM HELP YOU",
      subSteps: [
        {
          itemId: "add",
          label: "Add a variable",
          content: (
            <Fragment>
              <InfoBox highlight>Variables make data streams smart</InfoBox>
              <InfoBox>
                Click the{" "}
                <span style={{ color: "#B062C2" }}>{`<Command>`}</span> to add a
                variable
              </InfoBox>
            </Fragment>
          ),
        },
        {
          itemId: "take",
          label: "Take Note",
          content: (
            <Fragment>
              <InfoBox highlight>Label</InfoBox>
              <InfoBox>
                <ol style={{ paddingLeft: "24px" }}>
                  <li>
                    “top loggers” are services that log more than your budget
                    can handle. The name of the variable is “Service_list”
                  </li>
                  <li>
                    Your code only needs to reference the variable named
                    “service_list”. We compute them for you automatically.
                  </li>
                  <li>
                    The “service_list” behavior is managed by configuration as
                    well. Learn more here.
                  </li>
                </ol>
              </InfoBox>
            </Fragment>
          ),
        },
        {
          itemId: "vizualize",
          label: "Vizualize The Results",
          content: <div></div>,
        },
      ],
    },
  ].map(({ itemId, label, subSteps }) => (
    <TreeItem
      key={itemId}
      sx={css([NavTreeItemStyles, NavTreeItemTourStyles])}
      itemId={itemId}
      label={label}
    >
      {subSteps.map(({ itemId: id, label, content }) => (
        <TreeItem
          key={`${itemId}-${id}`}
          sx={css([
            NavTreeItemStyles,
            NavTreeItemTourStyles,
            NavTreeSubStepStyles,
          ])}
          itemId={`${itemId}-${id}`}
          label={label}
        >
          {content}
        </TreeItem>
      ))}
    </TreeItem>
  ));
}
