import { css } from "@emotion/react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Typography from "@mui/material/Typography";
import { useState } from "react";
import { drawerWidth } from "../NavDrawer/NavDrawer";
import { useLocalStorage } from "../hooks/useLocalStorage";

const DialogStyles = css({
  marginLeft: `${drawerWidth}px`,
  marginRight: 0,
  maxWidth: "733px",
});

export function WelcomeModal() {
  const [hideModalForever, setHideModalForever] = useLocalStorage(
    "enoughAlready",
    false
  );
  const [open, setOpen] = useState(!hideModalForever);

  const handleClose = () => {
    setOpen(false);
  };

  const handleCloseForeverOrUntilLocalStorageIsCleared = () => {
    setHideModalForever(true);
    setOpen(false);
  };

  return (
    <Dialog
      slotProps={{
        paper: {
          sx: DialogStyles,
        },
      }}
      open={open}
      onClose={handleClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">
        Welcome to the MyDecisive.ai demo
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          <Typography component={"span"}>
            Learn about different configurations of our SmartHub and see how to
            instantly control your telemetry data. Everything is pre-configured
            and ready to use.
          </Typography>
          <br />
          <br />
          <Typography component={"span"} sx={{ fontWeight: 700 }}>
            This is a demo.
          </Typography>
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button
          size="medium"
          sx={{ textTransform: "capitalize" }}
          variant="text"
          onClick={handleCloseForeverOrUntilLocalStorageIsCleared}
        >
          Don't show this again
        </Button>
        <Button
          size="medium"
          sx={{ textTransform: "capitalize" }}
          variant="contained"
          onClick={handleClose}
        >
          Got it
        </Button>
      </DialogActions>
    </Dialog>
  );
}
