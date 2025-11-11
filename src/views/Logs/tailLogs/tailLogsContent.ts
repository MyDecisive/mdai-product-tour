import rawCollectorLogs from "./collectorLogs.txt?raw";
import rawNoisyServiceLogs from "./noisyServiceLogs.txt?raw";
import rawServiceLogs from "./serviceLogs.txt?raw";
import rawXtraNoisyServiceLogs from "./xtraNoisyServiceLogs.txt?raw";

import type { LogRecord } from "../../../utils/types";
import { braidLogs } from "./braidLogs";
import { parseRawCollectorLogs, parseRawServiceLogs } from "./parseRawLogs";

export const errorLogs: LogRecord[] = [
  { message: "Failed to connect to external API", level: "error" },
  { message: "Database query timeout after 30s", level: "error" },
  { message: "Invalid JSON in request body", level: "error" },
  { message: "Rate limit exceeded for client 192.168.1.100", level: "warn" },
];

export const serviceLogs: LogRecord[] = parseRawServiceLogs(rawServiceLogs);

const noisyServiceLogs: LogRecord[] = parseRawServiceLogs(rawNoisyServiceLogs);

const xtraNoisyServiceLogs: LogRecord[] = parseRawServiceLogs(
  rawXtraNoisyServiceLogs
);

export const braidedLogsAll: LogRecord[] = braidLogs(
  serviceLogs,
  noisyServiceLogs,
  xtraNoisyServiceLogs
);

export const collectorLogs: LogRecord[] =
  parseRawCollectorLogs(rawCollectorLogs);

export const braidedLogsServiceAndNoisy: LogRecord[] = braidLogs(
  serviceLogs,
  noisyServiceLogs
);
