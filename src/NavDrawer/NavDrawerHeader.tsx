import { css } from "@emotion/react";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import IconButton from "@mui/material/IconButton";
import Toolbar from "@mui/material/Toolbar";
import type { View } from "../types";
import { getViewTitle } from "./content";
import { NavDrawerHeaderStyles, NavDrawerStyles } from "./styles";

type NavDrawerHeaderProps = {
  view?: View;
  onBack: () => void;
};

export function NavDrawerHeader({ view, onBack }: NavDrawerHeaderProps) {
  return (
    <Toolbar sx={css([NavDrawerStyles, NavDrawerHeaderStyles])}>
      {view && (
        <IconButton onClick={onBack}>
          <ArrowBackIosIcon />
        </IconButton>
      )}

      {getViewTitle(view)}
    </Toolbar>
  );
}
