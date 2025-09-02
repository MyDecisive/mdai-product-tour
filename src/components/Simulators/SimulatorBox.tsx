import { Box, Link, Typography } from "@mui/material";
import type { SimulatorBoxProps } from "../../utils/types";

export function SimulatorBox({
  title,
  link,
  href,
  children,
  styles,
  innerStyles,
}: SimulatorBoxProps) {
  return (
    <>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          ...styles,
        }}
      >
        <Typography variant="subtitle1">{title}</Typography>
        {link && href && (
          <Link
            href={href}
            variant="body2"
            underline="hover"
            target="_blank"
            rel="noopener"
          >
            {link}
          </Link>
        )}
      </Box>
      <Box
        sx={{
          p: 1,
          minHeight: "350px",
          maxWidth: "100%",
          borderRadius: "4px",
          background: "#393939",
          border: "2px solid #393939",
          ...innerStyles,
        }}
      >
        {children}
      </Box>
    </>
  );
}
