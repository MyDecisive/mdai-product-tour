import { css } from "@emotion/react";
import Box from "@mui/material/Box";
import type { ReactNode } from "react";

const InfoBoxStyles = css({
  border: "2px solid #B062C2",
  borderRadius: "4px",
  padding: "16px",
  margin: "12px 32px 32px -18px",
});

type InfoBoxProps = {
  children: ReactNode;
};

export function InfoBox({ children }: InfoBoxProps) {
  return <Box sx={css([InfoBoxStyles])}>{children}</Box>;
}
