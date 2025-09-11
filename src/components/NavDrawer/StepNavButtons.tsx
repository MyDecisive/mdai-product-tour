import { css } from "@emotion/react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
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
    handleNextButtonClick,
    handlePrevButtonClick,
    handleResetButtonClick,
  } = useNavButtonHandlers();

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
