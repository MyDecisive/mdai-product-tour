import { Box, Typography } from "@mui/material";
import { green, grey, red, yellow } from "@mui/material/colors";
import type { LogRecord } from "../../../utils/types";

type LogRowProps = LogRecord;

const formatTimestamp = (timestamp: string): string => {
  return new Date(timestamp).toISOString().split("T")[1].split(".")[0];
};

const getLogLevel = (log: LogRecord): string => {
  if (log.level) return log.level.toUpperCase();
  if (log.message && log.message.toLowerCase().includes("error"))
    return "ERROR";
  if (log.message && log.message.toLowerCase().includes("warn")) return "WARN";
  return "INFO";
};

const getLogLevelColor = (level: string): string => {
  switch (level) {
    case "ERROR":
      return red[400];
    case "WARN":
    case "WARNING":
      return yellow[400];
    case "DEBUG":
      return grey[400];
    default:
      return green[400];
  }
};

export function LogRow(props: LogRowProps) {
  const level = getLogLevel(props);
  const levelColor = getLogLevelColor(level);

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "flex-start",
        "&:hover": {
          backgroundColor: grey[900],
        },
        borderRadius: "8px",
        padding: "2px 4px",
        maxWidth: "100%",
        boxSizing: "border-box",
      }}
    >
      <Typography
        variant="caption"
        sx={{
          fontFamily:
            'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace',
          fontSize: 13,
          lineHeight: 1.5,
          color: grey[500],
          flexShrink: 0,
        }}
      >
        {props.timestamp && formatTimestamp(props.timestamp)}
      </Typography>
      <Typography
        variant="caption"
        sx={{
          fontFamily:
            'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace',
          fontSize: 13,
          lineHeight: 1.5,
          fontWeight: "bold",
          flexShrink: 0,
          width: "48px",
          color: levelColor,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {level}
      </Typography>
      <Typography
        sx={{
          fontFamily:
            'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace',
          fontSize: 13,
          lineHeight: 1.5,
          color: grey[200],
          wordBreak: "break-all",
          whiteSpace: "pre-wrap",
          flex: "0 1 auto",
        }}
      >
        {props.message || props.content || JSON.stringify(props)}
      </Typography>
    </Box>
  );
}
