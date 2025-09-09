import { Typography } from "@mui/material";

export function SimulatorContextLabel({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Typography
      variant="body2"
      color="text.secondary"
      sx={{
        display: "block",
        position: "absolute",
        top: "2px",
        left: "2px",
        background: "#00000059",
        px: "4px",
        borderRadius: "8px",
        width: "fit-content",
      }}
    >
      {children}
    </Typography>
  );
}
