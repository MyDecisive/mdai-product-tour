import { css } from "@emotion/react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";

type StepNavButtonsProps = {
  onNext: () => void;
  onPrev: () => void;
  onReset?: () => void;
};

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

export function StepNavButtons({
  onNext,
  onPrev,
  onReset,
}: StepNavButtonsProps) {
  return (
    <Box sx={ContainerStyles}>
      <Button variant="text" onClick={onReset}>
        Reset
      </Button>
      <Box sx={NavButtonBoxStyles}>
        <Button variant="text" onClick={onPrev}>
          Prev
        </Button>
        <Button variant="contained" onClick={onNext}>
          Next
        </Button>
      </Box>
    </Box>
  );
}
