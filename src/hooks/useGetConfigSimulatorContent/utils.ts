import type { ConfigContent, ConfigLine } from "../../utils/engineTypesScratch";
import type { LineChangeBlock } from "../../utils/types";

export const createChangeMap = (
  changes: LineChangeBlock[]
): Map<number, string> => {
  const changeMap = new Map<number, string>();

  changes?.forEach((block) => {
    block.changeLines.forEach((oldValue, index) => {
      const lineNo = block.start + index;
      changeMap.set(lineNo, oldValue);
    });
  });

  return changeMap;
};

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

function determineChangeEnd(
  end: number | undefined,
  changeLinesLength: number,
  linesLength: number
) {
  if (end !== undefined) {
    return end;
  }
  if (changeLinesLength > 0) {
    return changeLinesLength;
  }
  return linesLength;
}

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
    const changeEnd = determineChangeEnd(end, changeLines.length, lines.length);

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
