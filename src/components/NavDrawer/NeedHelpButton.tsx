import { css } from "@emotion/react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { useHighlander } from "../../hooks/useHighlander";

const textStyles = css({
  fontWeight: 600,
});

const rowStyles = css({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  gap: "16px",
  marginBottom: "40px",
  paddingTop: "8px",
});

export function NeedHelpButton() {
  const { actions } = useHighlander();

  return (
    <Box sx={rowStyles}>
      <Typography sx={textStyles}>Stuck?</Typography>
      <Button
        color="secondary"
        onClick={() => actions.OPEN_BIG_CONTENT_MODAL("contact")}
      >
        We've got you.
      </Button>
    </Box>
  );
}
