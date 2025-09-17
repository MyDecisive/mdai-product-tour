import { Box, Button, css, Typography } from "@mui/material";
import { useMemo } from "react";
import postfilter from "../../assets/dynamic-example.gif";
import preFilter from "../../assets/filter-example.gif";
import logsView from "../../assets/logs-example.gif";
import { selectNavigation } from "../../contexts/selectors";
import { useHighlander } from "../../hooks/useHighlander";
import { useSelector } from "../../hooks/useSelector";
import { ITEM_IDS } from "../../utils/constants";

const stepVizMap = {
  [ITEM_IDS.step1_data]: {
    src: logsView,
    alt: "Logs Visualization",
    style: {
      width: "100%",
      maxWidth: "600px",
    },
    label: "See the results!",
    content: "Data’s flowing. Next stop: Let’s save you some serious money.",
  },
  [ITEM_IDS.step2_explore]: {
    src: preFilter,
    alt: "Prefilter Visualization",
    style: {
      width: "100%",
    },
    label: "Nice work on the filters!",
    content:
      "You are cutting down the noise big-time. One hitch--Service1234 and 4321 are missing from Datadog. Don’t worry, we’ll get it right together.",
  },
  [ITEM_IDS.step3_take]: {
    src: postfilter,
    alt: "Postfilter Visualization",
    style: {
      width: "100%",
    },
    label: "Visualize the results",
    content: "",
  },
};

const ButtonContainerStyles = css({
  display: "flex",
  flexDirection: "row",
  justifyContent: "flex-end",
  gap: "12px",
  paddingTop: "12px",
});

export function StepResults({ handleClose }: { handleClose: () => void }) {
  const { subStep } = useSelector(selectNavigation);
  const { actions } = useHighlander();
  const { src, alt, style, label, content } = useMemo(() => {
    if (subStep && Object.keys(stepVizMap).includes(subStep)) {
      return stepVizMap[subStep as keyof typeof stepVizMap];
    }

    return {} as {
      src: undefined;
      alt: undefined;
      style: undefined;
      label: string;
      content: string;
    };
  }, [subStep]);

  return (
    <>
      <Typography sx={{ fontWeight: 700 }} component="div">
        {label}
      </Typography>
      <Typography component={"div"} sx={{ py: 1 }}>
        {content}
      </Typography>
      <img src={src} alt={alt} style={style} />
      <Box sx={ButtonContainerStyles}>
        <Button variant="text" onClick={handleClose}>
          Prev
        </Button>
        <Button
          variant="contained"
          onClick={() => {
            actions.GO_NEXT_STEP();
            if (subStep !== ITEM_IDS.step3_take) {
              handleClose();
            }
          }}
        >
          Next
        </Button>
      </Box>
    </>
  );
}
