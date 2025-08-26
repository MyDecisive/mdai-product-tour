import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Typography from "@mui/material/Typography";
import { useState } from "react";

export function WelcomeModal() {
  const [open, setOpen] = useState(true);

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Dialog
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
          <Typography>
            Learn about different configurations of our SmartHub and see how to
            instantly control your telemetry data. Everything is pre-configured
            and ready to use.
          </Typography>
          <br />
          <Typography sx={{ fontWeight: 700 }}>This is a demo.</Typography>
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button variant="text" onClick={handleClose}>
          Don't show this again
        </Button>
        <Button variant="contained" onClick={handleClose}>
          Got it
        </Button>
      </DialogActions>
    </Dialog>
  );
}
