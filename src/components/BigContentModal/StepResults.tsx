import { Box, Button, css, Typography } from "@mui/material";
import { useCallback, useMemo, useRef, useState } from "react";
import { useGetDrawerContent } from "../../hooks/useGetDrawerContent";
import type {
  EngineContentItem,
  EngineSubStep,
} from "../../utils/engineTypesScratch";
import { getVideoUrl } from "../../utils/getAssets";
import type { VisualizationContentItem } from "../../utils/types";

const ButtonContainerStyles = css({
  display: "flex",
  flexDirection: "row",
  gap: "12px",
  paddingTop: "12px",
});

function isVisualization(
  item: EngineContentItem | VisualizationContentItem
): item is VisualizationContentItem {
  return (
    "src" in item &&
    "alt" in item &&
    typeof item.src === "string" &&
    typeof item.alt === "string"
  );
}

function currentDrawerItemToVizModalData(
  currentDrawerItem: EngineSubStep | undefined
) {
  if (
    !currentDrawerItem ||
    !currentDrawerItem?.visualizationModal ||
    !currentDrawerItem.content?.length
  ) {
    return undefined;
  }

  const firstBlockWithTitle = currentDrawerItem.content.find(
    (block) => !!block.title
  );

  if (!firstBlockWithTitle) {
    return undefined;
  }
  const visualizationContent = firstBlockWithTitle.items.find(isVisualization);

  if (!visualizationContent) {
    return undefined;
  }
  const title = firstBlockWithTitle.title;

  return {
    title,
    text: visualizationContent.text,
    src: visualizationContent.src,
    alt: visualizationContent.alt,
  } as VisualizationContentItem & { title: string | null };
}

export function StepResults({ handleClose }: { handleClose: () => void }) {
  const { currentDrawerItem, handleNextButtonClick, handlePrevButtonClick } =
    useGetDrawerContent();

  const resultsProps = useMemo(() => {
    return currentDrawerItemToVizModalData(currentDrawerItem);
  }, [currentDrawerItem]);

  const [playing, setPlaying] = useState<boolean>(false);

  const videoTagRef = useRef<HTMLVideoElement | null>(null);

  const playVideo = () => {
    if (videoTagRef && videoTagRef.current) {
      void videoTagRef.current.play();
    }
  };

  const onClickNext = useCallback(() => {
    handleNextButtonClick();
    handleClose();
  }, [handleNextButtonClick, handleClose]);

  const onClickPrev = useCallback(() => {
    handlePrevButtonClick();
    handleClose();
  }, [handleClose, handlePrevButtonClick]);

  if (!resultsProps) {
    return null;
  }

  const { src, alt, title, text } = resultsProps;

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
            {title}
          </Typography>
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
          <Button variant="text" onClick={onClickPrev}>
            Prev
          </Button>
          <Button variant="contained" onClick={onClickNext}>
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
            src={getVideoUrl(src)}
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
