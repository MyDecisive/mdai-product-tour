import { useEffect, useState } from "react";
import { Box, LinearProgress, Typography } from "@mui/material";

type BarsProps = {
  title: string;
  value?: number;
  amount?: number;
  reverse?: boolean;
};

export function Bars({ title, value = 0, amount = 0, reverse = false }: BarsProps) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const percentTarget = value > 0 ? Math.min(100, Math.max(0, (amount / value) * 100)) : 0;
    const duration = 500;
    const startTime = performance.now();

    const step = (timestamp: number) => {
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const interpolatedValue = progress * percentTarget;
      setDisplayValue(interpolatedValue);

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };

    requestAnimationFrame(step);
  }, [amount, value]);

  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <Typography variant="caption" sx={{ width: "40%", pr: 1 }}>
        {title}
      </Typography>
      <Box
        sx={{
          width: { lg: "100%", md: "60%" },
          display: "flex",
          p: 0,
        }}
      >
        <LinearProgress
          variant="determinate"
          color={reverse ? "primary" : "secondary"}
          value={displayValue}
          sx={{ transform: reverse ? "scaleX(-1)" : "none" }}
        />
      </Box>
      <Typography variant="caption" sx={{ width: "40%", pl: 1 }}>
        {amount} GB/min
      </Typography>
    </Box>
  );
}
