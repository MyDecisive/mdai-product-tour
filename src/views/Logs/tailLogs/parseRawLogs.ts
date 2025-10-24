import type { LogRecord } from "../../../utils/types";

export function parseRawLogFileToLogLines(rawLogString: string): LogRecord[] {
  const logStrings = rawLogString
    .trim()
    .split("\n")
    .filter((line) => line.trim());

  const logFormat = determineLogFormat(logStrings[0]);

  if (logFormat === "serviceLogs") {
    return serviceLogStringsToLogRecords(logStrings);
  }

  if (logFormat === "collectorLogs") {
    return collectorLogStringsToLogRecords(logStrings);
  }

  return [];
}

export function determineLogFormat(logString: string) {
  const serviceParts = logString.split(" - ");
  if (serviceParts.length === 6) {
    return "serviceLogs";
  }
  const errorOrcollectorParts = logString.split(/\s+/);
  if (errorOrcollectorParts.length === 4) {
    return "collectorLogs";
  }

  if (errorOrcollectorParts.length === 5) {
    return "errorLogs";
  }

  return "unknown";
}

export function serviceLogStringsToLogRecords(
  logStrings: string[]
): LogRecord[] {
  return logStrings.reduce((acc, line) => {
    // Parse format: timestamp - service - team - region - level - message
    const parts = line.split(" - ");

    if (parts.length < 6) {
      console.warn("Invalid log format:", line);
      return acc;
    }

    const [, service, team, region, level, ...messageParts] = parts;
    const message = messageParts.join(" - ");

    acc.push({
      level: level as LogRecord["level"],
      message: `${service} - ${message} - ${team} - ${region}`,
    });
    return acc;
  }, [] as LogRecord[]);
}

export function collectorLogStringsToLogRecords(
  logStrings: string[]
): LogRecord[] {
  return logStrings.reduce((acc, line) => {
    // Parse format: timestamp    level    component    json_data
    const parts = line.split(/\s+/);

    if (parts.length < 4) {
      console.warn("Invalid structured log format:", line);
      return acc;
    }

    const [, level, component, ...jsonParts] = parts;
    const jsonString = jsonParts.join(" ");

    try {
      const message = `${component}: ${jsonString}`;

      acc.push({
        level: level.toUpperCase() as LogRecord["level"],
        message,
      });
    } catch (e) {
      console.warn(`Failed to parse JSON in log: ${line}`, e);
      return acc;
    }
    return acc;
  }, [] as LogRecord[]);
}

export function errorLogStringsToLogRecords(logStrings: string[]): LogRecord[] {
  return logStrings.reduce((acc, line) => {
    // Parse format: timestamp    level    component    message    json_data
    const parts = line.split(/\s+/);

    if (parts.length < 5) {
      console.warn("Invalid structured log format:", line);
      return acc;
    }

    const [, level, component, msg, ...jsonParts] = parts;
    const jsonString = jsonParts.join(" ");

    try {
      const message = `${component}: ${msg} ${jsonString}`;

      acc.push({
        level: level.toUpperCase() as LogRecord["level"],
        message,
      });
    } catch (e) {
      console.warn(`Failed to parse JSON in log: ${line}`, e);
      return acc;
    }
    return acc;
  }, [] as LogRecord[]);
}
