import { css } from "@emotion/react";
import { Box, Button, List, ListItem, Typography } from "@mui/material";
import type { MouseEvent, ReactNode } from "react";
import { useGetPanelContent } from "../../hooks/useGetPanelContent";
import { useHighlander } from "../../hooks/useHighlander";
import { ITEM_IDS } from "../../utils/constants";
import type {
  StepItemMap,
  ViewStepOrder,
  ViewTreeItemProps,
} from "../../utils/types";
import { hydrateViewTreeitems } from "../common";

const InlineButtonStyles = css({
  padding: 0,
  textTransform: "none",
  lineHeight: "24px",
  fontWeight: 400,
  fontSize: "1rem",
  minWidth: 0,
});

const SubStepStyles = css({
  borderRadius: "4px",
  padding: "8px 8px 8px 16px",
  display: "flex",
  flexDirection: "column",
  gap: "16px",
  cursor: "default",
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
                  color: "#EA80FC",
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
                  color: "#EA80FC",
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
                  color: "#EA80FC",
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
                  color: "#EA80FC",
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
  const makeHandleClick = (component: string) => () => {
    const statusSimBox = document.getElementsByClassName(component);
    if (statusSimBox.length > 0) {
      const element = statusSimBox[0] as HTMLElement;
      const computedStyles = getComputedStyle(element);
      const oldTransition = computedStyles.transition;
      const oldBorderColor = computedStyles.borderColor;

      element.style.transition = "border-color 0.5s ease";
      element.style.borderColor = "#B062C2";

      element.scrollIntoView({ behavior: "smooth", block: "start" });
      setTimeout(() => {
        element.style.borderColor = oldBorderColor;
      }, 1000);
      setTimeout(() => {
        element.style.transition = oldTransition;
      }, 1500);
    } else {
      console.warn("No element with class 'status' found.");
    }
  };
  return (
    <SubStepContent>
      We'll start the synthetic services in our K8S cluster. This will generate
      the data we need to use, as the MyDecisive SmartHub is currently running
      but idle (see{" "}
      <Button
        onClick={makeHandleClick("status")}
        variant="text"
        sx={InlineButtonStyles}
      >
        Status
      </Button>{" "}
      Window).{" "}
      <Box sx={{ overflowX: "auto" }}>
        <pre style={{ color: "#83ACDE" }}>{`./mdai-kind.sh logs`}</pre>
      </Box>
      {"and then"}
      <Box sx={{ overflowX: "auto" }}>
        <pre
          style={{ color: "#83ACDE" }}
        >{`helm upgrade --install --repo https://fluent.github.io/helm-charts fluent fluentd -f ./synthetics/loggen_fluent_config.yaml`}</pre>
      </Box>
      to open the floodgates. <br />
      <br />
      Next, we start Fluentd containers to stream logs from services like
      "service1234" and "service4321.” The{" "}
      <Button
        onClick={makeHandleClick("status")}
        variant="text"
        sx={InlineButtonStyles}
      >
        Status
      </Button>{" "}
      window will confirm the container start, and the{" "}
      <Button
        onClick={makeHandleClick("tail-logs")}
        variant="text"
        sx={InlineButtonStyles}
      >
        Tail Logs
      </Button>{" "}
      window will show the incoming log data.
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
      We only edited the OTEL configuration, and MyDecisive's SmartHub
      automatically deployed the new logic. The cluster also adjusted to support
      the new pipelines without losing any data.
    </SubStepContent>
  );
}

function TakeNote() {
  const { actions } = useHighlander();
  const makeOnListItemClick = (lineNo: number) => {
    return () => {
      const configContainer = document.getElementById("otel_ref.yaml-tabpanel");
      if (!configContainer) return;

      if (configContainer.hidden) {
        actions.SET_ACTIVE_TAB("otel_ref.yaml");

        setTimeout(() => {
          continueWithScroll();
        }, 400);
      } else {
        continueWithScroll();
      }

      function continueWithScroll() {
        const el = configContainer!.querySelector<HTMLDivElement>(
          `[data-line="${lineNo}"]`
        );
        if (!el) return;

        const containerRect = configContainer!.getBoundingClientRect();
        const elementRect = el.getBoundingClientRect();
        const scrollTarget =
          configContainer!.scrollTop +
          (elementRect.top - containerRect.top) -
          24;

        configContainer!.scrollTo({ top: scrollTarget, behavior: "smooth" });
        setTimeout(() => {
          el.style.animation = "backgroundPulse 1s ease-out forwards";

          setTimeout(() => {
            el.style.animation = "";
          }, 999);
        }, 200);
      }
    };
  };

  return (
    <SubStepContent>
      <List>
        <ListItem
          onClick={makeOnListItemClick(78)}
          sx={[ListItemStyles, { mb: 1 }, { cursor: "pointer" }]}
        >
          <Typography>
            In <span style={{ color: "#B062C2" }}>line 78</span> of the
            OTEL_REF.YAML file, you define a rule that says drop logs from
            “service4321”.
          </Typography>
        </ListItem>
        <ListItem
          onClick={makeOnListItemClick(100)}
          sx={[ListItemStyles, { mb: 1 }, { cursor: "pointer" }]}
        >
          <Typography>
            In <span style={{ color: "#B062C2" }}>line 100</span> you enable
            this filter rule.
          </Typography>
        </ListItem>
        <ListItem sx={[ListItemStyles, { mb: 1 }]}>
          <Typography>
            We are now actively dropping all logs from service4321, which saves
            you money. The downside is that this approach uses basic, static
            OTEL, which is suboptimal.
          </Typography>
        </ListItem>
      </List>
    </SubStepContent>
  );
}

function ExploreThe() {
  return (
    <SubStepContent title="Static Filtration is online!">
      You’re now running OTEL and K8S like a devops boss. Service4321 is being
      filtered out but let’s do better.
    </SubStepContent>
  );
}

function Results2() {
  return <SubStepContent title="">{""}</SubStepContent>;
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
      {`We are now working with two areas in the "Config" window: OTEL and dynamic variables.`}
      <List>
        <ListItem sx={[ListItemStyles]}>
          Select HUB_REF.YAML. Line 49 defines a dynamic "noisy" service filter
          (replacing the static service4321 drop).
        </ListItem>

        <ListItem sx={[ListItemStyles, { flexDirection: "column" }]}>
          <pre style={{ width: "100%", overflowX: "auto", color: "#83ACDE" }}>
            kubectl apply -f mdai/hub/hub_ref.yaml
          </pre>
          updates your MDAI hub
        </ListItem>
        <ListItem sx={[ListItemStyles, { flexDirection: "column" }]}>
          <pre style={{ width: "100%", overflowX: "auto", color: "#83ACDE" }}>
            kubectl apply -f otel/otel_ref.yaml
          </pre>
          puts the variable to use in your OTel collector
        </ListItem>
      </List>
    </SubStepContent>
  );
}

function TakeNote2() {
  const makeHandleClick =
    (component: string) => (e: MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      const statusSimBox = document.getElementsByClassName(component);
      if (statusSimBox.length > 0) {
        const element = statusSimBox[0] as HTMLElement;
        const computedStyles = getComputedStyle(element);
        const oldTransition = computedStyles.transition;
        const oldBorderColor = computedStyles.borderColor;

        element.style.transition = "border-color 0.5s ease";
        element.style.borderColor = "#B062C2";

        element.scrollIntoView({ behavior: "smooth", block: "start" });
        setTimeout(() => {
          element.style.borderColor = oldBorderColor;
        }, 1000);
        setTimeout(() => {
          element.style.transition = oldTransition;
        }, 1500);
      } else {
        console.warn(`No element with class '${component}' found.`);
      }
    };
  const { actions } = useHighlander();
  const makeOnListItemClick = (fileName: string, lineNo: number) => {
    return () => {
      const configContainer = document.getElementById(
        `${fileName}.yaml-tabpanel`
      );
      if (!configContainer) return;

      if (configContainer.hidden) {
        actions.SET_ACTIVE_TAB(`${fileName}.yaml`);

        setTimeout(() => {
          continueWithScroll();
        }, 400);
      } else {
        continueWithScroll();
      }

      function continueWithScroll() {
        const el = configContainer!.querySelector<HTMLDivElement>(
          `[data-line="${lineNo}"]`
        );
        if (!el) return;

        const containerRect = configContainer!.getBoundingClientRect();
        const elementRect = el.getBoundingClientRect();
        const scrollTarget =
          configContainer!.scrollTop +
          (elementRect.top - containerRect.top) -
          24;

        configContainer!.scrollTo({ top: scrollTarget, behavior: "smooth" });

        setTimeout(() => {
          el.style.animation = "backgroundPulse 1s ease-out forwards";

          setTimeout(() => {
            el.style.animation = "";
          }, 999);
        }, 200);
      }
    };
  };

  return (
    <SubStepContent title="What’s happening in the config file? ">
      <List>
        <ListItem sx={[ListItemStyles]}>
          <Typography sx={BulletStyle}>1.</Typography>
          <Typography>
            We are now working with two areas in the{" "}
            <Button
              onClick={makeHandleClick("config")}
              variant="text"
              sx={InlineButtonStyles}
            >
              Config
            </Button>{" "}
            window: OTEL and dynamic variables.
          </Typography>
        </ListItem>
        <ListItem
          sx={[ListItemStyles, { cursor: "pointer" }]}
          onClick={makeOnListItemClick("hub_ref", 11)}
        >
          <Typography sx={BulletStyle}>2.</Typography>
          <Typography>
            Select HUB_REF.YAML. Line 11 defines a dynamic "noisy" service
            filter (replacing the static service4321 drop).
          </Typography>
        </ListItem>
        <ListItem
          sx={[ListItemStyles, { cursor: "pointer" }]}
          onClick={makeOnListItemClick("hub_ref", 44)}
        >
          <Typography sx={BulletStyle}>3.</Typography>
          <Typography>
            Line 44 contains the PromQL query that sets the "noisy" threshold
            and duration.
          </Typography>
        </ListItem>
        <ListItem sx={[ListItemStyles]}>
          <Typography sx={BulletStyle}>4.</Typography>
          <Typography>
            Check OTEL_REF.YAML (Lines{" "}
            <Button
              onClick={makeOnListItemClick("otel_ref", 77)}
              variant="text"
              sx={InlineButtonStyles}
            >
              77
            </Button>{" "}
            &{" "}
            <Button
              onClick={makeOnListItemClick("otel_ref", 99)}
              variant="text"
              sx={InlineButtonStyles}
            >
              99
            </Button>
            ) to see how these variables make OTEL dynamic.
          </Typography>
        </ListItem>
        <ListItem sx={[ListItemStyles]}>
          <Typography sx={BulletStyle}>5.</Typography>
          <Typography>
            The key: The SmartHub detects log volume and configuration changes
            and adjusts the cluster configuration instantly to meet your budget.
          </Typography>
        </ListItem>
      </List>

      <Typography>This is dynamic, real-time observability control.</Typography>
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
    label: "Step 3: Dynamic OTEL → Power-User Mode",
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
    label: "Generate synthethic log data",
    content: <DataStarts />,
  },
  [ITEM_IDS.step1_results]: {
    label: "See The Results",
    content: <SeeResults />,
  },
  [ITEM_IDS.step2_configure]: {
    label: "Configure static filters",
    content: <TakeNote />,
  },
  [ITEM_IDS.step2_take]: {
    label: "Static Filtration is online!",
    content: <ExploreThe />,
  },
  [ITEM_IDS.step2_explore]: {
    label: "The big deal?",
    content: <ConfigureStatus />,
  },
  [ITEM_IDS.step2_results]: {
    label: "See Results!",
    content: <Results2 />,
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
      ITEM_IDS.introduction_consolidated,
      ITEM_IDS.introduction_meet,
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
      ITEM_IDS.step2_results,
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
