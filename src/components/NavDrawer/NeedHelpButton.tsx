import { css } from "@emotion/react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { useState } from "react";
import { ContactModal } from "../ContactModal/ContactModal";

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
  const [open, setOpen] = useState<boolean>(false);
  return (
    <Box sx={rowStyles}>
      <Typography sx={textStyles}>Need help?</Typography>
      <Button color="secondary" onClick={() => setOpen(true)}>
        Contact us now
      </Button>
      <ContactModal open={open} handleClose={() => setOpen(false)} />
    </Box>
  );
}
