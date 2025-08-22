import { css } from "@emotion/react";
import Box from "@mui/material/Box";
import type { ReactNode } from "react";

const InfoBoxStyles = css({
  border: "2px solid #B062C2",
  borderRadius: "4px",
  padding: "16px",
  fontWeight: 400,
});

type InfoBoxProps = {
  children: ReactNode;
  highlight?: boolean;
};

export function InfoBox({ children, highlight }: InfoBoxProps) {
  return (
    <Box
      sx={css([
        InfoBoxStyles,
        highlight
          ? { backgroundColor: "#D4C0FF", padding: "6px 12px", fontWeight: 500 }
          : {},
      ])}
    >
      {children}
    </Box>
  );
}
