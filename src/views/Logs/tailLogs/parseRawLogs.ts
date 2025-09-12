import type { LogRecord } from "../../../utils/types";

export function parseRawServiceLogs(rawLogString: string): LogRecord[] {
  return rawLogString
    .trim()
    .split("\n")
    .filter((line) => line.trim())
    .reduce((acc, line) => {
      // Parse format: timestamp - service - team - region - level - message
      const parts = line.split(" - ");

      if (parts.length < 6) {
        console.warn("Invalid log format:", line);
        return acc;
      }

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const [_, service, team, region, level, ...messageParts] = parts;
      const message = messageParts.join(" - ");

      acc.push({
        level: level as LogRecord["level"],
        message: `${service} - ${message} - ${team} - ${region}`,
      });
      return acc;
    }, [] as LogRecord[]);
}

export function parseRawCollectorLogs(rawLogString: string): LogRecord[] {
  return rawLogString
    .trim()
    .split("\n")
    .filter((line) => line.trim())
    .reduce((acc, line) => {
      // Parse format: timestamp    level    component    json_data
      const parts = line.split(/\s+/);

      if (parts.length < 4) {
        console.warn("Invalid structured log format:", line);
        return acc;
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const [_, level, component, ...jsonParts] = parts;
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
