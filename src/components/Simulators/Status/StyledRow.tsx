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
          gap: "4px",
        },
        containerStyles,
      ])}
    >
      <Typography
        sx={{
          flex: "1 1 70%",

          fontFamily:
            'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace',
          fontSize: 13,
          lineHeight: 1.5,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {name}
      </Typography>
      <Typography
        sx={{
          flex: "1 1 10%",

          fontFamily:
            'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace',
          fontSize: 13,
          lineHeight: 1.5,
          textAlign: "end",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {status}
      </Typography>
      <Typography
        sx={{
          flex: "1 1 8%",

          fontFamily:
            'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace',
          fontSize: 13,
          lineHeight: 1.5,
          textAlign: "end",
        }}
      >
        {ready}
      </Typography>
      <Typography
        sx={{
          flex: "1 1 12%",

          fontFamily:
            'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace',
          fontSize: 13,
          lineHeight: 1.5,
          textAlign: "end",
        }}
      >
        {restarts}
      </Typography>
    </Box>
  );
}
