import type {
  ActivePod,
  ActivePodMap,
  ConfigContent,
  ConfigLine,
  EngineTargetState,
  LogRecord,
  TerminalTypedOptions,
} from "../types/player";
import type { LineChangeBlock } from "../types/tour";
import {
  CURSOR_CHAR,
  POD_NAME_DELIM,
  STATUS,
  TERMINAL_PROMPT,
} from "../utils/constants";

/**
 * Logs
 */

export function createEmptyLogs(): NonNullable<EngineTargetState["logs"]> {
  return {
    activeContext: "",
    allContexts: {},
  };
}

function createLogId(
  cycleCount: number,
  index: number,
  isError?: boolean
): string {
  return isError
    ? `error-${Date.now()}-${Math.random()}`
    : `log-${cycleCount}-${index}`;
}

export function createLogRecord(
  propLog: LogRecord,
  cycleCount: number,
  index: number,
  isError?: boolean
): LogRecord {
  return {
    ...propLog,
    timestamp: new Date().toISOString(),
    id: createLogId(cycleCount, index, isError),
  };
}

export function braidLogs(...logArrays: LogRecord[][]): LogRecord[] {
  const result: LogRecord[] = [];
  const indices = Array.from({ length: logArrays.length }, () => 0);

  // Calculate ratios based on array lengths for proportional distribution
  const lengths = logArrays.map((arr) => arr.length);
  const totalLength = lengths.reduce((sum, len) => sum + len, 0);
  const ratios = lengths.map((len) => len / totalLength);

  let position = 0;

  while (indices.some((idx, i) => idx < logArrays[i].length)) {
    // Find which array should contribute the next log based on ratios
    for (let i = 0; i < logArrays.length; i++) {
      const expectedCount = Math.floor(position * ratios[i]);
      const actualCount = indices[i];

      if (actualCount <= expectedCount && indices[i] < logArrays[i].length) {
        result.push(logArrays[i][indices[i]]);
        indices[i]++;
        position++;
        break;
      }
    }

    // Fallback: add from first available array if ratio logic doesn't advance
    if (result.length === position - 1) {
      for (let i = 0; i < logArrays.length; i++) {
        if (indices[i] < logArrays[i].length) {
          result.push(logArrays[i][indices[i]]);
          indices[i]++;
          position++;
          break;
        }
      }
    }
  }

  return result;
}
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

  if (logFormat === "errorLogs") {
    return errorLogStringsToLogRecords(logStrings);
  }

  if (logFormat === "kubernetesLogs") {
    return kubernetesLogStringsToLogRecords(logStrings);
  }

  return [];
}

function determineLogFormat(logString: string) {
  // Check for kubernetes format first
  if (
    logString.includes("kubernetes.var.log.containers") &&
    logString.includes(": {")
  ) {
    return "kubernetesLogs";
  }

  const serviceParts = logString.split(" - ");
  if (serviceParts.length === 6) {
    return "serviceLogs";
  }
  const errorOrcollectorParts = logString.split(/\s{3,}/);
  if (errorOrcollectorParts.length > 3) {
    const hasErrors = logString.split(" error ").length > 1;
    return hasErrors ? "errorLogs" : "collectorLogs";
  }

  return "unknown";
}

function serviceLogStringsToLogRecords(logStrings: string[]): LogRecord[] {
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

function collectorLogStringsToLogRecords(logStrings: string[]): LogRecord[] {
  return logStrings.reduce((acc, line) => {
    // Parse format: timestamp    level    component    json_data
    const parts = line.split(/\s{3,}/);

    if (parts.length < 4) {
      console.warn("Invalid structured log format:", line);
      return acc;
    }

    const [, level, component, ...jsonParts] = parts;
    const jsonString = jsonParts.join(" ");

    const message = `${component} ${jsonString}`;

    acc.push({
      level: level.toUpperCase() as LogRecord["level"],
      message,
    });

    return acc;
  }, [] as LogRecord[]);
}

function errorLogStringsToLogRecords(logStrings: string[]): LogRecord[] {
  return logStrings.reduce((acc, line) => {
    // Parse format: timestamp    level    component    message    json_data
    const parts = line.split(/\s+/);

    if (parts.length < 5) {
      console.warn("Invalid structured log format:", line);
      return acc;
    }

    const [, level, component, msg, ...jsonParts] = parts;
    const jsonString = jsonParts.join(" ");

    const message = `${component}: ${msg} ${jsonString}`;

    acc.push({
      level: level.toUpperCase() as LogRecord["level"],
      message,
    });

    return acc;
  }, [] as LogRecord[]);
}

function kubernetesLogStringsToLogRecords(logStrings: string[]): LogRecord[] {
  return logStrings.reduce((acc, line) => {
    // Parse format: timestamp kubernetes.path: {json}
    const beginningOfLine = line.indexOf("kubernetes");

    if (beginningOfLine === -1) {
      console.warn("Invalid kubernetes log format:", line);
      return acc;
    }

    try {
      const message = line.slice(beginningOfLine);
      const levelMatch = message.match(/"level":"([a-zA-Z]+)"/);

      if (!levelMatch) {
        console.warn("No level found in log", line);
        return acc;
      }
      acc.push({
        level: levelMatch[1],
        message,
      });
    } catch (e) {
      console.warn("Failed to parse kubernetes log JSON:", line);
      console.error("error parsing k8s log line: ", e);
    }

    return acc;
  }, [] as LogRecord[]);
}

/**
 * Terminal
 */

const userEntryBehavior: Partial<TerminalTypedOptions> = {
  prompt: TERMINAL_PROMPT,
  typeSpeed: 70,
  backSpeed: 150,
  cursorChar: CURSOR_CHAR,
  showCursor: true,
  contentType: "html",
};

// NOTE: For good terminal simulation, the `strings` array for this one should only have a single line in it. Just repeat for as many lines as the terminal is supposed to be executing.
const terminalExecutionBehavior: Partial<TerminalTypedOptions> = {
  startDelay: 500,
  typeSpeed: 5,
  cursorChar: CURSOR_CHAR,
  showCursor: true,
  contentType: "html",
};

export function createTerminalContent(
  strings: string[],
  printed: boolean,
  behavior?: string
): TerminalTypedOptions[] {
  if (behavior === "terminal") {
    return [
      {
        ...terminalExecutionBehavior,
        strings: ["\n"],
        printed,
      },
    ].concat(
      strings.map((string) => ({
        ...terminalExecutionBehavior,
        strings: [string],
        printed,
      }))
    );
  }

  return [
    {
      ...userEntryBehavior,
      printed,
      strings: strings.map(
        (str) => `\`${userEntryBehavior.prompt}\` ^850${str}`
      ),
    },
  ];
}

/**
 * Config
 */
export const createChangeMap = (
  changes: LineChangeBlock[]
): Map<number, string> => {
  const changeMap = new Map<number, string>();

  changes?.forEach((block) => {
    block.changeLines?.forEach((oldValue, index) => {
      const lineNo = block.start + index;
      changeMap.set(lineNo, oldValue);
    });

    if (block.start != null && block.end) {
      for (let i = block.start; i < block.end + 1; i++) {
        if (changeMap.get(i)) continue;
        changeMap.set(i, "");
      }
    }
  });

  return changeMap;
};

export function rawLinesFromText(yaml: string): string[] {
  return yaml.split("\n");
}

export function createConfigContentGroups(
  fileName: string,
  relevantSections: (
    | { type: "gap"; lineNo: number }
    | { type: "group"; start: number; lines: string[] }
  )[],
  changeMap: Map<number, string>
) {
  const groups: ConfigContent[] = [];

  relevantSections.forEach((section) => {
    if (section.type === "gap") {
      groups.push(section);
    } else {
      const lines: ConfigLine[] = section.lines.map((line, i) => {
        const lineNo = section.start + i;
        const newContent = changeMap.get(lineNo);

        return {
          lineNo,
          content: line,
          ...(newContent && {
            changeLineNo: lineNo,
            changeContent: newContent,
          }),
        };
      });

      const start = section.start;
      const end = start + section.lines.length - 1;
      const isChangeBlock = lines.some((l) => l.changeContent !== undefined);

      groups.push({
        type: "group",
        groupId: `${fileName}-${start}-${end}`,
        start,
        end,
        lines,
        isChangeBlock,
      });
    }
  });

  return groups;
}

// parsing/crawling yaml lines
const findYamlParents = (lines: string[], lineNo: number): number[] => {
  const parents: number[] = [];
  let targetIndent = lines[lineNo - 1]?.match(/^(\s*)/)?.[1]?.length ?? 0;

  for (let i = lineNo - 2; i >= 0; i--) {
    const line = lines[i];
    if (!line?.trim() || line.trim().startsWith("#")) continue;

    const indent = line.match(/^(\s*)/)?.[1]?.length ?? 0;

    if (indent < targetIndent && line.includes(":")) {
      parents.unshift(i + 1);
      targetIndent = indent;
      if (indent === 0) break;
    }
  }

  return parents;
};

function determineChangeEnd(
  start: number,
  end: number | undefined,
  changeLinesLength: number,
  linesLength: number
) {
  if (end !== undefined) {
    return end;
  }
  if (changeLinesLength > 0) {
    return start + changeLinesLength - 1;
  }
  return start + linesLength - 1;
}

/**
 * Note for debugging/reasoning about this function:
 * reference to LineNos refers to file line numbers, NOT array indices.
 */
export const extractRelevantSections = (
  lines: string[],
  changes: LineChangeBlock[],
  contextSpacing = 2
): (
  | { type: "gap"; lineNo: number }
  | { type: "group"; start: number; lines: string[] }
)[] => {
  if (!changes?.length || !lines.length) return [];

  const changeLineNos = new Set<number>();
  const contextLineNos = new Set<number>();

  changes.forEach(({ start, end, changeLines }) => {
    const changeEnd = determineChangeEnd(
      start,
      end,
      changeLines?.length || 0,
      lines.length
    );

    // Add changed lines and their parents
    for (let i = start; i <= changeEnd; i++) {
      changeLineNos.add(i);
      findYamlParents(lines, i).forEach((p) => contextLineNos.add(p));
    }

    // Add context lines
    const contextStart = Math.max(1, start - contextSpacing);
    const contextEnd = Math.min(lines.length, changeEnd + contextSpacing);
    for (let i = contextStart; i <= contextEnd; i++) {
      if (lines[i - 1]?.trim()) contextLineNos.add(i);
    }
  });

  // Build sections
  const allLineNos = new Set([...changeLineNos, ...contextLineNos]);
  const sortedLineNos = Array.from(allLineNos).sort((a, b) => a - b);
  const sections: ReturnType<typeof extractRelevantSections> = [];
  let groupStart = sortedLineNos[0];
  let groupLineNos: number[] = [groupStart];

  for (let i = 1; i < sortedLineNos.length; i++) {
    const oneHigherThanPreviousLineNo = sortedLineNos[i - 1] + 1;
    const isConsecutiveLineNo =
      sortedLineNos[i] === oneHigherThanPreviousLineNo;

    if (isConsecutiveLineNo) {
      const isSameTypeAsPreviousLine =
        changeLineNos.has(sortedLineNos[i]) ===
        changeLineNos.has(sortedLineNos[i - 1]);
      if (isSameTypeAsPreviousLine) {
        // keep building the section
        groupLineNos.push(sortedLineNos[i]);
        continue;
      }
    }

    // section is complete, add it, a gap, and restart
    sections.push({
      type: "group",
      start: groupStart,
      lines: groupLineNos.map((n) => lines[n - 1]), // replace lineNos with line content
    });
    if (!isConsecutiveLineNo) {
      sections.push({ type: "gap", lineNo: oneHigherThanPreviousLineNo });
    }
    groupStart = sortedLineNos[i];
    groupLineNos = [groupStart];
  }

  // Add the last group from the mutable variables.
  sections.push({
    type: "group",
    start: groupStart,
    lines: groupLineNos.map((n) => lines[n - 1]), // replace lineNos with line content
  });

  return sections;
};

/**
 * Status
 */
export function findReplacementPod(
  currentPod: ActivePod,
  activePods: ActivePodMap
): ActivePod | undefined {
  return Object.values(activePods).find((active) => {
    const differentPodSource =
      active.parentServiceKey !== currentPod.parentServiceKey;
    const sameNamespace = active.namespace === currentPod.namespace;

    const podNameDelimIdx = active.name.lastIndexOf(POD_NAME_DELIM);

    const sameService = currentPod.name.startsWith(
      active.name.substring(0, podNameDelimIdx)
    );
    const activeIsRunning = active.status === STATUS.running;

    return (
      differentPodSource && sameNamespace && sameService && activeIsRunning
    );
  });
}
