import { css } from "@emotion/react";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { Paper } from "@mui/material";
import Box from "@mui/material/Box";
import Dialog from "@mui/material/Dialog";
import IconButton from "@mui/material/IconButton";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { useGetBigContentModalPresentationLayer } from "./content";

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

export function BigContentModal() {
  const { title, ContentComponent, handleClose } =
    useGetBigContentModalPresentationLayer();

  const open = title !== null && ContentComponent !== null;

  return (
    <Dialog
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
      <Box>
        <Toolbar sx={toolbarStyles}>
          <Typography sx={{ fontWeight: 700, fontSize: "24px" }}>
            {title || ""}
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
      </Box>
    </Dialog>
  );
}
