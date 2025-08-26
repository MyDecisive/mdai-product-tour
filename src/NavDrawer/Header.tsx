import { css } from "@emotion/react";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import IconButton from "@mui/material/IconButton";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import type { View } from "../types";
import { getViewTitle } from "./strings";

type HeaderProps = {
  view?: View;
  onBack: () => void;
};

const viewStyles = css({
  height: "48px",
  padding: "4px",
  display: "flex",
  gap: "4px",
  ["@media (min-width: 600px)"]: {
    minHeight: "initial",
    padding: "4px",
  },
});

const homeTextStyles = css({
  fontSize: "24px",
  fontWeight: 700,
  fontFamily: "Inter",
  color: "#EDEDED",
});

const viewTextStyles = css({
  flexGrow: 5,
  fontSize: "16px",
  fontWeight: 400,
});

const backButtonStyles = css({
  flexShrink: 1,
});

export function Header({ view, onBack }: HeaderProps) {
  return (
    <Toolbar sx={view ? viewStyles : undefined}>
      {view && (
        <IconButton sx={backButtonStyles} onClick={onBack}>
          <ArrowBackIcon />
        </IconButton>
      )}
      <Typography sx={view ? viewTextStyles : homeTextStyles}>
        {getViewTitle(view)}
      </Typography>
    </Toolbar>
  );
}
