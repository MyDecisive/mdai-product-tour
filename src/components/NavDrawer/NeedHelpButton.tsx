import { css } from "@emotion/react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

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

// TODO: click handler to open modal
export function NeedHelpButton() {
  return (
    <Box sx={rowStyles}>
      <Typography sx={textStyles}>Need help?</Typography>
      <Button color="secondary">Contact us now</Button>
    </Box>
  );
}
