import { css } from "@emotion/react";
import Button from "@mui/material/Button";
import { Fragment } from "react/jsx-runtime";

import { InfoBox, TreeItem } from "../components";
import { NavTreeSubStepStyles, PrimaryCTAButtonStyles } from "./styles";

type DLFViewContentProps = {};

export function DLFViewContent({}: DLFViewContentProps) {
  return [
    {
      itemId: "introduction",
      label: "Introduction",
      subSteps: [
        {
          itemId: "what",
          label: "What is Dynamic log Filtering",
          content: (
            <Fragment>
              <InfoBox title={"Filtering log data to improve signal"}>
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
              <InfoBox title="Consolidated tools">
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
      label: "Step 1: Get the data flowing",
      subSteps: [
        {
          itemId: "data",
          label: "Data Starts to Flow",
          content: (
            <Fragment>
              <InfoBox title="Use our built-in log stream generator">
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
      label: "Step 2: Drop unwanted data",
      subSteps: [
        {
          itemId: "configure",
          label: "Configure static filters",
          content: (
            <Fragment>
              <InfoBox title="We use OpenTelemetry static filters">
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
              <InfoBox title="We prepare the data for you">
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
              <InfoBox title="OTEL is now running">
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
              <InfoBox title="Saving Money but...">
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
      label: "Step 3: Let the system help you",
      subSteps: [
        {
          itemId: "add",
          label: "Add a variable",
          content: (
            <Fragment>
              <InfoBox title="Variables make data streams smart">
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
              <InfoBox title="Label">
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
    <TreeItem key={itemId} itemId={itemId} label={label} topLevel>
      {subSteps.map(({ itemId: id, label, content }) => (
        <TreeItem
          key={`${itemId}-${id}`}
          sx={css([NavTreeSubStepStyles])}
          itemId={`${itemId}-${id}`}
          label={label}
        >
          {content}
        </TreeItem>
      ))}
    </TreeItem>
  ));
}
