import { css } from "@emotion/react";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

const styles = css({
  border: "1px solid #3A3A3A",
  borderRadius: "4px",
  display: "flex",
  flexDirection: "column",
  gap: "8px",
  alignItems: "center",
  paddingTop: "18px",
  paddingBottom: "12px",
  color: "#3A3A3A",
  backgroundColor: "#FFFFFF",
  [`&:hover`]: {
    borderColor: "#3A3A3A",
  },
});

// TODO: click handler to open modal
export function NeedHelpButton() {
  return (
    <Button sx={css(styles)}>
      <Typography sx={{ fontWeight: 600 }}>NEED HELP?</Typography>
      <Typography>Contact us now</Typography>
    </Button>
  );
}
