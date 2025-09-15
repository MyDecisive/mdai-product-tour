import { Box, Button, css, Divider, Typography } from "@mui/material";
import { useMemo } from "react";
import logsView from "../../assets/logs.gif";
import postfilter from "../../assets/post-filter.gif";
import preFilter from "../../assets/prefilter.gif";
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
      maxWidth: "900px",
      aspectRation: "1/1",
    },
    label: "See the results!",
    content: "Data’s flowing. Next stop: Let’s save you some serious money.",
  },
  [ITEM_IDS.step2_explore]: {
    src: preFilter,
    alt: "Prefilter Visualization",
    style: {
      width: "100%",
      maxWidth: "900px",
      aspectRation: "1.25/1",
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
      maxWidth: "900px",
      aspectRation: "1.25/1",
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
      <Typography component={"div"}>{content}</Typography>
      <img src={src} alt={alt} style={style} />
      <Divider />
      <Box sx={ButtonContainerStyles}>
        <Button variant="text" onClick={handleClose}>
          Wait a sec
        </Button>
        <Button
          variant="contained"
          onClick={() => {
            actions.GO_NEXT_STEP();
            handleClose();
          }}
        >
          Move on
        </Button>
      </Box>
    </>
  );
}
