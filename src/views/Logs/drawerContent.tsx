import { css } from "@emotion/react";
import { Box, Link, List, ListItem, Typography } from "@mui/material";
import type { ReactNode } from "react";
import { useGetPanelContent } from "../../hooks/useGetPanelContent";
import { ITEM_IDS } from "../../utils/constants";
import type {
  StepItemMap,
  ViewStepOrder,
  ViewTreeItemProps,
} from "../../utils/types";
import { hydrateViewTreeitems } from "../common";

const SubStepStyles = css({
  borderRadius: "4px",
  padding: "8px 16px",
  display: "flex",
  flexDirection: "column",
  gap: "16px",
});

const SubStepTitleStyles = css({
  fontWeight: 700,
});

const SubStepBodyStyles = css({});

type SubStepProps = {
  children: ReactNode;
  title?: ReactNode;
};

export function SubStepContent({ children, title }: SubStepProps) {
  return (
    <Box sx={SubStepStyles}>
      {title && (
        <Typography component="span" sx={SubStepTitleStyles}>
          {title}
        </Typography>
      )}
      <Typography component="span" sx={SubStepBodyStyles}>
        {children}
      </Typography>
    </Box>
  );
}

function MeetDLF() {
  return (
    <SubStepContent>
      Big bills? Not cool. Dynamic Log Filtering helps you slash up to 90% of
      your Datadog or New Relic spend. Here’s how, in three painless steps.
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

function YourGuide() {
  return (
    <List>
      <ListItem sx={ListItemStyles}>
        <Typography sx={BulletStyle}>Step 1:</Typography>
        <Typography>Turn on the tap</Typography>
      </ListItem>
      <ListItem sx={ListItemStyles}>
        <Typography sx={BulletStyle}>Step 2:</Typography>
        <Typography>Toss the junk</Typography>
      </ListItem>
      <ListItem sx={ListItemStyles}>
        <Typography sx={BulletStyle}>Step 3:</Typography>
        <Typography>Kick back, let the system shine</Typography>
      </ListItem>
    </List>
  );
}

function UnifiedView() {
  const {
    panelState: { config, terminal, status, logs },
  } = useGetPanelContent();

  return (
    <SubStepContent title="Consolidated tools">
      <Typography>
        Multiple tools in one unified view--making it easy to see how MyDecisive
        works.
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
              IDE Simulator:
            </span>{" "}
            Tweak and control SmartHub through its config files.
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
              Terminal Simulator:
            </span>{" "}
            Deploy changes to SmartHub like a pro
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
              Status Simulator:
            </span>{" "}
            Keep an eye on running SmartHub processes and components
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
              Tail logs Simulator:
            </span>{" "}
            Watch SmartHub's logs stream by in real time.
          </Typography>
        </ListItem>
      </List>
      <Typography>
        You can also navigate through the steps with your left and right arrow
        keys.
      </Typography>
    </SubStepContent>
  );
}

function DataStarts() {
  return (
    <SubStepContent title="Simulate the log stream">
      Starting with the MDAI cluster already running, run{" "}
      <Box sx={{ overflowX: "auto" }}>
        <pre style={{ color: "#B062C2" }}>{`./mdai-kind.sh logs`}</pre>
      </Box>
      {"and then"}
      <Box sx={{ overflowX: "auto" }}>
        <pre
          style={{ color: "#B062C2" }}
        >{`helm upgrade --install --repo https://fluent.github.io/helm-charts fluent fluentd -f ./synthetics/loggen_fluent_config.yaml`}</pre>
      </Box>
      to open the floodgates. <br />
      <br /> Watch the SmartHub come alive in the Status Simulator Window{" "}
      <span style={{ color: "#B062C2" }}>Status Simulator window</span> <br />
      <br />
      Heads up: you’ll get to see the results in the next step
    </SubStepContent>
  );
}

function SeeResults() {
  return (
    <SubStepContent title="See the results!">
      Data’s flowing. Next stop: Let’s save you some serious money.
    </SubStepContent>
  );
}

function ConfigureStatus() {
  return (
    <SubStepContent title="Your data, your rules">
      OpenTelemetry static filters give you control and freedom--forever at no
      cost, no added vendor charges.
    </SubStepContent>
  );
}

function TakeNote() {
  return (
    <SubStepContent title="We’ve got the heavy lifting covered, so working with your logs is a breeze.">
      <ol style={{ paddingLeft: "24px" }}>
        <li>
          In this example, Service4321 are just part of the generated data. They
          are some random service names like you might have.
        </li>
        <li>
          “mdai_service” is a variable--yep, a little bit of magic. Hang tight,
          you’ll learn more about variables in just a minute.
        </li>
      </ol>
    </SubStepContent>
  );
}

function ExploreThe() {
  return (
    <SubStepContent title="OTEL’s online!">
      Your collector is running in the SmartHub, and the dashboards confirm:
      Service4321 are filtered out.
    </SubStepContent>
  );
}

function VisualizeThe2() {
  return (
    <SubStepContent title="Nice work on the filters!">
      You are cutting down the noise big-time. One hitch--Service4321 are
      missing from Datadog. Don’t worry, we’ll get it right together.
    </SubStepContent>
  );
}

function AddA() {
  return (
    <SubStepContent>
      {`Variables == smarter data streams.  Use these commands to add one to your configuration file now:`}
      <ol style={{ paddingLeft: "24px" }}>
        <li>
          <Box sx={{ overflowX: "auto" }}>
            <pre style={{ color: "#B062C2" }}>
              kubectl apply -f mdai/hub/hub_ref.yaml
            </pre>
          </Box>
          updates your MDAI hub
        </li>
        <li>
          <Box sx={{ overflowX: "auto" }}>
            <pre style={{ color: "#B062C2" }}>
              kubectl apply -f otel/otel_ref.yaml
            </pre>
          </Box>
          puts the variable to use in your OTel collector
        </li>
      </ol>
    </SubStepContent>
  );
}

function TakeNote2() {
  return (
    <SubStepContent title="What’s happening in the config file? ">
      <ol style={{ paddingLeft: "24px" }}>
        <li>
          Top loggers: Services that log more than your budget can handle are
          called your top loggers. We store them in a variable called
          "service_list".
        </li>
        <li>
          Easy reference: Your code only needs to reference "service_list". We
          handle the heavy lifting—dynamically computing top loggers and keeping
          the variable updated continuously.
        </li>
        <li>
          Config-controlled behavior: The "service_list" computation itself is
          managed via configuration too. Learn more <Link>here.</Link>
        </li>
      </ol>
    </SubStepContent>
  );
}

export const stepItemsMap: StepItemMap = {
  [ITEM_IDS.introduction]: {
    label: "Let's set the stage",
  },
  [ITEM_IDS.step1]: {
    label: "Step 1: Get the data flowing",
  },
  [ITEM_IDS.step2]: {
    label: "Step 2: Drop unwanted data",
  },
  [ITEM_IDS.step3]: {
    label: "Step 3: Kick back and let our system shine...",
  },

  [ITEM_IDS.introduction_meet]: {
    label: "Meet Dynamic Log Filtering",
    content: <MeetDLF />,
  },
  [ITEM_IDS.introduction_guide]: {
    label: "Your guide to using this demo.",
    content: <YourGuide />,
  },
  [ITEM_IDS.introduction_consolidated]: {
    label: "This is a consolidated experience",
    content: <UnifiedView />,
  },
  [ITEM_IDS.step1_data]: {
    label: "Data Starts to Flow",
    content: <DataStarts />,
  },
  [ITEM_IDS.step1_results]: {
    label: "See The Results",
    content: <SeeResults />,
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
    label: "See the results",
    content: <VisualizeThe2 />,
  },
  [ITEM_IDS.step3_add]: {
    label: "Sprinkle in some variables.",
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
    subStepIds: [
      ITEM_IDS.introduction_meet,
      ITEM_IDS.introduction_consolidated,
    ],
  },
  {
    stepId: ITEM_IDS.step1,
    subStepIds: [ITEM_IDS.step1_data],
  },
  {
    stepId: ITEM_IDS.step2,
    subStepIds: [
      ITEM_IDS.step2_configure,
      ITEM_IDS.step2_take,
      ITEM_IDS.step2_explore,
    ],
  },
  {
    stepId: ITEM_IDS.step3,
    subStepIds: [ITEM_IDS.step3_add, ITEM_IDS.step3_take],
  },
];

export const viewTreeitems: ViewTreeItemProps[] = hydrateViewTreeitems(
  stepItemsMap,
  STEP_ORDER
);
