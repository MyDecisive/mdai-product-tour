import { Box, Button, css, Typography } from "@mui/material";
import { useMemo, useRef, useState } from "react";
import postfilter from "../../assets/dynamic-example.mp4";
import preFilter from "../../assets/filter-example.mp4";
import logsView from "../../assets/logs-example.mp4";
import { selectNavigation } from "../../contexts/selectors";
import { useHighlander } from "../../hooks/useHighlander";
import { useSelector } from "../../hooks/useSelector";
import { ITEM_IDS } from "../../utils/constants";

export const stepVizMap = {
  [ITEM_IDS.step1_data]: {
    src: logsView,
    alt: "Logs Visualization",
    style: {
      width: "100%",
    },
    label: "See the results!",
    content:
      "Data’s flowing. Note that everything coming in from FluentD goes out to your observability vendor. There is no filtering going on. Next stop: Let’s save you some serious money.",
  },
  [ITEM_IDS.step2_explore]: {
    src: preFilter,
    alt: "Prefilter Visualization",
    style: {
      width: "100%",
    },
    label: "Nice work on the filters!",
    content:
      "You are cutting down the noise big-time. One hitch--Service4321 are missing from Datadog. Don’t worry, we’ll get it right together.",
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

  const [playing, setPlaying] = useState<boolean>(false);

  const videoTagRef = useRef<HTMLVideoElement | null>(null);

  const playVideo = () => {
    if (videoTagRef && videoTagRef.current) {
      void videoTagRef.current.play();
    }
  };

  return (
    <>
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          gap: "8px",
          alignItems: "center",
        }}
      >
        <Box sx={{ flexGrow: 1 }}>
          <Typography sx={{ fontWeight: 700 }} component="div">
            {label}
          </Typography>
          {content && (
            <Typography component={"div"} sx={{ py: 1 }}>
              {content}
            </Typography>
          )}
        </Box>
        <Box sx={ButtonContainerStyles}>
          <Button disabled={playing} variant="text" onClick={playVideo}>
            Reset
          </Button>
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
      </Box>
      <Box sx={{ display: "flex", justifyContent: "center" }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            pt: 2,
            width: { xs: "100%", md: "70%" },
          }}
        >
          <video
            ref={videoTagRef}
            src={src}
            style={style}
            controls={false}
            autoPlay
            muted
            onPlay={() => setPlaying(true)}
            onEnded={() => setPlaying(false)}
          >
            {alt}
          </video>
        </Box>
      </Box>
    </>
  );
}
