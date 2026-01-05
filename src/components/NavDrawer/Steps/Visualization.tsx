import { Box, Button, css, Typography } from "@mui/material";
import { useRef, useState } from "react";
import type { VisualizationContentItem } from "../../../utils/drawerTypes";

const ButtonContainerStyles = css({
  display: "flex",
  flexDirection: "row",
  gap: "12px",
  paddingTop: "12px",
});

type VisualizationProps = {
  title?: string;
  item: VisualizationContentItem;
  handleClose: () => void;
};

// TODO: Handle multiple visualization items, multiple images or videos

export function Visualization({
  title,
  item: { src, alt, text },
  handleClose,
}: VisualizationProps) {
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
          {title && (
            <Typography sx={{ fontWeight: 700 }} component="div">
              {title}
            </Typography>
          )}
          {text && (
            <Typography component={"div"} sx={{ py: 1 }}>
              {text}
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
              handleClose();
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
            style={{ width: "100%" }}
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
