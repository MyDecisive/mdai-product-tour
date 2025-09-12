import { css } from "@emotion/react";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import IconButton from "@mui/material/IconButton";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";

import { useGetDrawerHeaderProps } from "../../hooks/useGetDrawerHeaderProps";

const homeStyles = css({
  height: "62px",
  padding: "4px",
});

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

export function Header() {
  const { inTour, drawerHeaderText, handleBackButtonClick } =
    useGetDrawerHeaderProps();

  return (
    <Toolbar sx={inTour ? viewStyles : homeStyles}>
      {inTour && (
        <IconButton sx={backButtonStyles} onClick={handleBackButtonClick}>
          <ArrowBackIcon />
        </IconButton>
      )}
      <Typography sx={inTour ? viewTextStyles : homeTextStyles}>
        {drawerHeaderText}
      </Typography>
    </Toolbar>
  );
}
