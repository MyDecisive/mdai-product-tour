import { Box, Button, css, Divider, Typography } from "@mui/material";
import { useMemo } from "react";
import logsView from "../../assets/logs.gif";
import postfilter from "../../assets/post-filter.gif";
import preFilter from "../../assets/prefilter.gif";
import { selectNavigation } from "../../contexts/selectors";
import { useSelector } from "../../hooks/useSelector";
import { ITEM_IDS } from "../../utils/constants";

const stepVizMap = {
  [ITEM_IDS.step1_results]: {
    src: logsView,
    alt: "Logs Visualization",
    style: {
      width: "100%",
      maxWidth: "900px",
      aspectRation: "1/1",
    },
  },
  [ITEM_IDS.step2_visualize]: {
    src: preFilter,
    alt: "Prefilter Visualization",
    style: {
      width: "100%",
      maxWidth: "900px",
      aspectRation: "1.25/1",
    },
  },
  [ITEM_IDS.step3_vizualize]: {
    src: postfilter,
    alt: "Postfilter Visualization",
    style: {
      width: "100%",
      maxWidth: "900px",
      aspectRation: "1.25/1",
    },
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

  const { src, alt, style } = useMemo(() => {
    if (subStep && Object.keys(stepVizMap).includes(subStep)) {
      return stepVizMap[subStep as keyof typeof stepVizMap];
    }

    return {} as { src: undefined; alt: undefined; style: undefined };
  }, [subStep]);

  return (
    <>
      <Typography sx={{ fontWeight: 700 }} component="div">
        See the results!
      </Typography>
      <Typography component={"div"}>
        Data’s flowing. Next stop: Let’s save you some serious money.
      </Typography>
      <img src={src} alt={alt} style={style} />
      <Divider />
      <Box sx={ButtonContainerStyles}>
        <Button variant="text" onClick={handleClose}>
          Wait a sec
        </Button>
        <Button
          variant="contained"
          onClick={() => {
            handleClose();
            // but also nav to next step
          }}
        >
          Move on
        </Button>
      </Box>
    </>
  );
}
