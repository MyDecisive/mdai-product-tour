import { css } from "@emotion/react";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import IconButton from "@mui/material/IconButton";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { useCurrentView } from "../../utils/NavigationContext";
import { Home } from "../../utils/constants";
import { getViewTitle } from "../../utils/strings";

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
  const { view, setView } = useCurrentView();

  const notHome = view !== Home;
  return (
    <Toolbar sx={notHome ? viewStyles : undefined}>
      {notHome && (
        <IconButton sx={backButtonStyles} onClick={() => setView(Home)}>
          <ArrowBackIcon />
        </IconButton>
      )}
      <Typography sx={notHome ? viewTextStyles : homeTextStyles}>
        {getViewTitle(view)}
      </Typography>
    </Toolbar>
  );
}
