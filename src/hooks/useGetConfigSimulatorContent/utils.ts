import { useMemo } from "react";
import type { LineChangeBlock, ProcessedLine } from "../../utils/types";

export const useStableValue = <T>(value: T) => {
  return useMemo(() => JSON.stringify(value), [value]);
};

export const createHighlightRanges = (
  highlights: LineChangeBlock[],
  maxEndIdx: number
): Set<number> => {
  const highlightSet = new Set<number>();

  highlights?.forEach(({ start, end }) => {
    for (let i = start; i <= (end || maxEndIdx); i++) {
      highlightSet.add(i);
    }
  });

  return highlightSet;
};

export const createChangeMap = (
  changes: LineChangeBlock[]
): Map<number, string> => {
  const changeMap = new Map<number, string>();

  changes?.forEach((block) => {
    block.oldValues.forEach((oldValue, index) => {
      const lineNo = block.start + index;
      changeMap.set(lineNo, oldValue);
    });
  });

  return changeMap;
};

// parsing/crawling yaml lines
export const findYamlParents = (lines: string[], lineNo: number): number[] => {
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

// shaping lines to meet component reqs
export const extractRelevantLines = (
  lines: string[],
  changes: LineChangeBlock[],
  contextLines = 2
): Set<number> => {
  const relevantLines = new Set<number>();

  if (!changes.length) {
    return relevantLines;
  }

  changes.forEach(({ start, end = lines.length + 1 }) => {
    for (let i = start; i <= end; i++) {
      relevantLines.add(i);

      findYamlParents(lines, i).forEach((parentLine) => {
        relevantLines.add(parentLine);
      });
    }

    for (
      let i = Math.max(1, start - contextLines);
      i <= Math.min(lines.length, end + contextLines);
      i++
    ) {
      if (lines[i].trim() === "") break;
      relevantLines.add(i);
    }
  });

  return relevantLines;
};

const createGapSection = (lineBeforeGap: string, startLineNo: number) => {
  const indentSpacesCount = lineBeforeGap?.match(/^(\s*)/)?.[1]?.length ?? 0;
  const indent = " ".repeat(indentSpacesCount + 2);

  return {
    lines: [`${indent}...`],
    startLineNo,
    isGap: true,
  };
};

const createSectionsFromLines = (
  lines: string[],
  relevantLines: Set<number>
): Array<{ lines: string[]; startLineNo: number; isGap: boolean }> => {
  const sections: Array<{
    lines: string[];
    startLineNo: number;
    isGap: boolean;
  }> = [];

  const sortedLines = Array.from(relevantLines).sort((a, b) => a - b);
  let currentSection: number[] = [];

  sortedLines.forEach((lineNo, index) => {
    const nextLineNo = sortedLines[index + 1];
    currentSection.push(lineNo);

    const isEndOfSection = !nextLineNo || nextLineNo > lineNo + 1;

    if (isEndOfSection) {
      const startLineNo = currentSection[0];
      const sectionLines = currentSection.map((num) => lines[num - 1]);
      sections.push({ lines: sectionLines, startLineNo, isGap: false });

      const shouldCreateGap = !!nextLineNo;

      if (shouldCreateGap) {
        const lineBeforeGap = sectionLines[sectionLines.length - 1];
        sections.push(createGapSection(lineBeforeGap, lineNo + 1));
      }

      currentSection = [];
    }
  });

  return sections;
};

export const extractRelevantSections = (
  lines: string[],
  changes: LineChangeBlock[],
  contextLines = 2
): Array<{ lines: string[]; startLineNo: number; isGap: boolean }> => {
  if (
    !changes?.length ||
    !lines.length ||
    (lines.length === 1 && lines[0] === "")
  ) {
    return [];
  }

  const relevantLines = extractRelevantLines(lines, changes, contextLines);
  return createSectionsFromLines(lines, relevantLines);
};

const createProcessedLine = (
  line: string,
  lineNo: number,
  changeMap: Map<number, string>,
  highlightRanges: Set<number>,
  lineToggles: Record<number, boolean>,
  isGap: boolean
): ProcessedLine => {
  const change = changeMap.get(lineNo);
  const showingNew = !!lineToggles[lineNo];
  if (change !== undefined) {
    return {
      lineNo,
      content: change,
      isHighlighted: highlightRanges.has(lineNo),
      newValue: line,
      showingNewValue: showingNew,
      isGap,
    };
  }

  return {
    lineNo,
    content: line,
    isHighlighted: false,
    showingNewValue: false,
    isGap,
  };
};

const shouldEndGroup = (
  currentLine: ProcessedLine,
  nextLine: ProcessedLine | undefined
): boolean => {
  if (!nextLine) return true;

  const isCurrentLineChanged = currentLine.isHighlighted;
  const isNextLineChanged = nextLine.isHighlighted;
  const isConsecutive = nextLine.lineNo === currentLine.lineNo + 1;

  return !isConsecutive || isCurrentLineChanged !== isNextLineChanged;
};

const groupConsecutiveChanges = (processedLines: ProcessedLine[]) => {
  const groups: Array<{
    lines: ProcessedLine[];
    startLineNo: number;
    endLineNo: number;
    isChangeBlock: boolean;
    isGap?: boolean;
  }> = [];

  let currentGroup: ProcessedLine[] = [];

  processedLines.forEach((line, index) => {
    const nextLine = processedLines[index + 1];
    currentGroup.push(line);

    if (shouldEndGroup(line, nextLine)) {
      groups.push({
        lines: currentGroup,
        startLineNo: currentGroup[0].lineNo,
        endLineNo: currentGroup[currentGroup.length - 1].lineNo,
        isChangeBlock: currentGroup.some((l) => l.isHighlighted),
        isGap: currentGroup[0].isGap,
      });
      currentGroup = [];
    }
  });

  return groups;
};

export function createTextGroups(
  rawLines: string[],
  changes: LineChangeBlock[],
  lineToggles: Record<number, boolean>
) {
  const sections = extractRelevantSections(rawLines, changes);
  const changeMap = createChangeMap(changes);
  const highlightRanges = createHighlightRanges(changes, rawLines.length);

  return sections
    .map((section) => ({
      ...section,
      processedLines: section.lines.map((line, i) => {
        const lineNo = section.startLineNo + i;
        return createProcessedLine(
          line,
          lineNo,
          changeMap,
          highlightRanges,
          lineToggles,
          section.isGap
        );
      }),
    }))
    .flatMap((section, sectionIndex) =>
      groupConsecutiveChanges(section.processedLines).map(
        (group, groupIndex) => ({
          ...group,
          sectionIndex,
          groupIndex,
        })
      )
    );
}
