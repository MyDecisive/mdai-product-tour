import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { Paper, Slide } from "@mui/material";
import Box from "@mui/material/Box";
import Dialog from "@mui/material/Dialog";
import IconButton from "@mui/material/IconButton";
import type { TransitionProps } from "@mui/material/transitions";
import React from "react";
import { useGetBigContentModalContent } from "./useGetBigContentModalContent";

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export function BigContentModal() {
  const { ContentComponent, handleClose } = useGetBigContentModalContent();

  const open = ContentComponent !== null;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      slots={{
        transition: Transition,
      }}
      slotProps={{
        paper: {
          sx: {
            padding: 0,
          },
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          gap: "12px",
          height: "100%",
        }}
      >
        <IconButton
          edge="start"
          onClick={handleClose}
          aria-label="close"
          sx={{
            position: "absolute",
            right: "40px",
            top: "40px",
            color: "#FFFFFF",
          }}
        >
          <CloseRoundedIcon />
        </IconButton>
        <Paper
          sx={{
            paddingX: "48px",
            paddingY: "40px",
            backgroundColor: "#272727",
            color: "#FFFFFF",
          }}
        >
          {ContentComponent && <ContentComponent handleClose={handleClose} />}
        </Paper>
      </Box>
    </Dialog>
  );
}
