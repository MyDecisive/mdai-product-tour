import { css } from "@emotion/react";
import Box from "@mui/material/Box";
import { Fragment, type ReactNode } from "react";

const InfoBoxStyles = css({
  border: "3px solid #EA80FC",
  borderRadius: "4px",
  padding: "16px",
  marginRight: "18px",
  fontWeight: 400,
  cursor: "default",
});

const InfoBoxTitleStyles = css({
  backgroundColor: "#D4C0FF",
  padding: "6px 12px",
  fontWeight: 500,
});

interface InfoBoxProps {
  children: ReactNode;
  title?: ReactNode;
}

export function InfoBox({ children, title }: InfoBoxProps) {
  return (
    <Fragment>
      {title && (
        <Box sx={css([InfoBoxStyles, InfoBoxTitleStyles])}>{title}</Box>
      )}
      <Box sx={css([InfoBoxStyles])}>{children}</Box>
    </Fragment>
  );
}
