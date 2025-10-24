import rawCollectorLogs from "./collectorLogs.txt?raw";
import rawErrorLogs from "./errorLogs.txt?raw";
import rawNoisyServiceLogs from "./noisyServiceLogs.txt?raw";
import rawServiceLogs from "./serviceLogs.txt?raw";
import rawXtraNoisyServiceLogs from "./xtraNoisyServiceLogs.txt?raw";

import type { LogRecord } from "../../../utils/types";
import { braidLogs } from "./braidLogs";
import { parseRawLogFileToLogLines } from "./parseRawLogs";

export const errorLogs: LogRecord[] = parseRawLogFileToLogLines(rawErrorLogs);

export const serviceLogs: LogRecord[] =
  parseRawLogFileToLogLines(rawServiceLogs);

const noisyServiceLogs: LogRecord[] =
  parseRawLogFileToLogLines(rawNoisyServiceLogs);

const xtraNoisyServiceLogs: LogRecord[] = parseRawLogFileToLogLines(
  rawXtraNoisyServiceLogs
);

export const braidedLogs: LogRecord[] = braidLogs(
  serviceLogs,
  noisyServiceLogs,
  xtraNoisyServiceLogs
);

export const collectorLogs: LogRecord[] =
  parseRawLogFileToLogLines(rawCollectorLogs);
