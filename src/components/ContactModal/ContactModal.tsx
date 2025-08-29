import { css } from "@emotion/react";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Dialog from "@mui/material/Dialog";
import IconButton from "@mui/material/IconButton";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { ContactForm } from "./ContactForm";

type ContactModalProps = {
  open: boolean;
  handleClose: () => void;
};

const toolbarStyles = css({
  height: "60px",
  display: "flex",
  justifyContent: "center",
  padding: 0,
  boxShadow: "0 4px 4px 0 #ECECEC40",
  backgroundColor: "#3A3A3A",
  color: "#FFFFFF",
  ["@media (min-width: 600px)"]: {
    minHeight: "initial",
    padding: 0,
  },
});

export function ContactModal({ open, handleClose }: ContactModalProps) {
  return (
    <Dialog
      fullScreen
      open={open}
      onClose={handleClose}
      slotProps={{
        paper: {
          sx: {
            padding: 0,
            borderRadius: 0,
          },
        },
      }}
    >
      <AppBar sx={{ position: "relative" }}>
        <Toolbar sx={toolbarStyles}>
          <Typography sx={{ fontWeight: 700, fontSize: "24px" }}>
            Contact Us
          </Typography>
          <IconButton
            edge="start"
            onClick={handleClose}
            aria-label="close"
            sx={{ position: "absolute", right: 0, color: "#FFFFFF" }}
          >
            <CloseRoundedIcon sx={{ width: "1.5em", height: "1.5em" }} />
          </IconButton>
        </Toolbar>
      </AppBar>
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-evenly",
          gap: "12px",
          marginTop: "48px",
          marginBottom: "54px",
          marginX: "80px",
        }}
      >
        <Box sx={{ flex: "1" }}>left</Box>
        <Box sx={{ flex: "1" }}>
          <ContactForm handleClose={handleClose} />
        </Box>
      </Box>
    </Dialog>
  );
}
