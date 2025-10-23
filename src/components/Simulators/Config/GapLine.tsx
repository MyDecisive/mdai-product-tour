import { Box } from "@mui/material";

export function GapLine({ lineNo }: { lineNo: number }) {
  return (
    <Box
      key={`line-${lineNo}`}
      data-line={lineNo}
      sx={{
        height: "1px",
        boxShadow: "0 1px 0 rgba(176, 98, 194, 0.3)",
        margin: "1px 0",
        position: "relative",
        "&::before": {
          content: '""',
          position: "absolute",
          left: "-8px",
          right: "-8px",
          top: "-1px",
          height: "2px",
          background:
            "linear-gradient(90deg, transparent, rgba(176, 98, 194, 0.3) 20%, rgba(176, 98, 194, 0.3) 80%, transparent)",
        },
      }}
    ></Box>
  );
}
