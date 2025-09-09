import { css } from "@emotion/react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { useEffect, useMemo } from "react";
import { useNavigation } from "../../hooks/useNavigation";
import { useNavButtonHandlers } from "../../hooks/useStepNavButtonHandlers";
import { Home } from "../../utils/constants";

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
  const { view } = useNavigation();
  const {
    handleNextButtonClick,
    handlePrevButtonClick,
    handleResetButtonClick,
  } = useNavButtonHandlers();

  const inTour = useMemo(() => view !== Home, [view]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (inTour) {
        if (e.key === "ArrowRight") {
          e.preventDefault();
          handleNextButtonClick();
        } else if (e.key === "ArrowLeft") {
          e.preventDefault();
          handlePrevButtonClick();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleNextButtonClick, handlePrevButtonClick, inTour]);

  return (
    <Box sx={ContainerStyles}>
      <Button variant="text" onClick={handleResetButtonClick}>
        Reset
      </Button>
      <Box sx={NavButtonBoxStyles}>
        <Button variant="text" onClick={handlePrevButtonClick}>
          Prev
        </Button>
        <Button variant="contained" onClick={handleNextButtonClick}>
          Next
        </Button>
      </Box>
    </Box>
  );
}
