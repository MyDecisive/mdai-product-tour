import { css } from "@emotion/react";
import { PlayCircleFilled } from "@mui/icons-material";
import { Box, Button } from "@mui/material";
import { useNavButtonHandlers } from "../../hooks/useStepNavButtonHandlers";

const ContainerStyles = css({
  display: "flex",
  flexDirection: "row",
  justifyContent: "space-between",
});

const NavButtonBoxStyles = css({
  display: "flex",
  flexDirection: "row",
  justifyContent: "flex-end",
  gap: "12px",
});

export function StepNavButtons() {
  const {
    isShowingPreviousContent,
    showPlayButton,
    nextButtonText,
    handleClickPlay,
    handleNextButtonClick,
    handlePrevButtonClick,
    handleResetButtonClick,
    nextButtonDisabled,
  } = useNavButtonHandlers();

  return (
    <Box
      sx={css([
        ContainerStyles,
        isShowingPreviousContent ? { justifyContent: "flex-end " } : {},
      ])}
    >
      {!isShowingPreviousContent && (
        <Button variant="text" onClick={handleResetButtonClick}>
          Reset
        </Button>
      )}
      <Box sx={NavButtonBoxStyles}>
        <Button variant="text" onClick={handlePrevButtonClick}>
          Prev
        </Button>
        {showPlayButton ? (
          <Button
            variant="contained"
            disabled={nextButtonDisabled}
            onClick={handleClickPlay}
          >
            <PlayCircleFilled />
          </Button>
        ) : (
          <Button
            disabled={nextButtonDisabled}
            variant="contained"
            onClick={handleNextButtonClick}
          >
            {nextButtonText}
          </Button>
        )}
      </Box>
    </Box>
  );
}
