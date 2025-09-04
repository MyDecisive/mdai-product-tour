import { css, type CSSObject } from "@emotion/react";
import { Box, Typography } from "@mui/material";

type StyleRowProps = {
  name: string;
  ready: string;
  status: string;
  restarts: string;
  containerStyles?: CSSObject;
};

export function StyledRow({
  name,
  ready,
  status,
  restarts,
  containerStyles,
}: StyleRowProps) {
  return (
    <Box
      sx={css([
        {
          display: "flex",
          flexDirection: "row",
          flexWrap: "nowrap",
          justifyContent: "space-evenly",
        },
        containerStyles,
      ])}
    >
      <Typography
        sx={{
          flex: "1 1 50%",
        }}
      >
        {name}
      </Typography>
      <Typography
        sx={{
          flex: "1 1 16.3%",
          textAlign: "end",
        }}
      >
        {ready}
      </Typography>
      <Typography
        sx={{
          flex: "1 1 16.3%",
          textAlign: "end",
        }}
      >
        {status}
      </Typography>
      <Typography
        sx={{
          flex: "1 1 16.3%",
          textAlign: "end",
        }}
      >
        {restarts}
      </Typography>
    </Box>
  );
}
