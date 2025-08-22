import { css } from "@emotion/react";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import IconButton from "@mui/material/IconButton";
import Toolbar from "@mui/material/Toolbar";
import type { View } from "../types";
import { getViewTitle } from "./content";
import { NavDrawerHeaderStyles, NavDrawerStyles } from "./styles";

type HeaderProps = {
  view?: View;
  onBack: () => void;
};

export function Header({ view, onBack }: HeaderProps) {
  return (
    <Toolbar sx={css([NavDrawerStyles, NavDrawerHeaderStyles])}>
      {view && (
        <IconButton onClick={onBack}>
          <ArrowBackIosIcon sx={{ color: "#3A3A3A" }} />
        </IconButton>
      )}

      {getViewTitle(view)}
    </Toolbar>
  );
}
