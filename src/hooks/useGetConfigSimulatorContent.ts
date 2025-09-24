import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { selectPanelState } from "../contexts/selectors";
import type {
  ConfigTextProps,
  LineChangeBlock,
  ProcessedLine,
} from "../utils/types";
import { useHighlander } from "./useHighlander";
import { useSelector } from "./useSelector";

const createHighlightRanges = (
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

const createGapSection = (lineBeforeGap: string, startLineNo: number) => {
  const indentSpacesCount = lineBeforeGap?.match(/^(\s*)/)?.[1]?.length ?? 0;
  const indent = " ".repeat(indentSpacesCount + 2);

  return {
    lines: [`${indent}...`],
    startLineNo,
    isGap: true,
  };
};

const extractRelevantLines = (
  lines: string[],
  changes: LineChangeBlock[],
  contextLines = 2
): Set<number> => {
  const relevantLines = new Set<number>();

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

    if (!nextLineNo || nextLineNo > lineNo + 1) {
      // TODO: extract this evaluation into a const with a meaningful name
      const startLineNo = currentSection[0];
      const sectionLines = currentSection.map((num) => lines[num - 1]);
      sections.push({ lines: sectionLines, startLineNo, isGap: false });

      if (nextLineNo) {
        // TODO: extract this evaluation into a const with a meaningful name
        const lineBeforeGap = sectionLines[sectionLines.length - 1];
        sections.push(createGapSection(lineBeforeGap, lineNo + 1));
      }

      currentSection = [];
    }
  });

  return sections;
};

const extractRelevantSections = (
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

const createChangeMap = (changes: LineChangeBlock[]): Map<number, string> => {
  const changeMap = new Map<number, string>();

  changes?.forEach((block) => {
    block.oldValues.forEach((oldValue, index) => {
      const lineNo = block.start + index;
      changeMap.set(lineNo, oldValue);
    });
  });

  return changeMap;
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

const smoothScrollTo = (
  element: HTMLElement,
  targetTop: number,
  duration: number = 1000
): Promise<void> => {
  return new Promise((resolve) => {
    const startTop = element.scrollTop;
    const distance = targetTop - startTop;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      const easeInOut =
        progress < 0.5
          ? 2 * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;

      element.scrollTop = startTop + distance * easeInOut;

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        resolve();
      }
    };

    requestAnimationFrame(animate);
  });
};

const calculateScrollTarget = (
  containerRef: React.RefObject<HTMLDivElement | null>,
  lineNo: number
): number | null => {
  const el = containerRef.current?.querySelector<HTMLDivElement>(
    `[data-line="${lineNo}"]`
  );

  if (!el || !containerRef.current) return null;

  const containerRect = containerRef.current.getBoundingClientRect();
  const elementRect = el.getBoundingClientRect();

  return (
    containerRef.current.scrollTop + (elementRect.top - containerRect.top) - 24 // TODO: make this `24` a constant. It's only being added for padding in the cases where the line being scrolled to is at the top of the container.
  );
};

const usePulsedLines = () => {
  const [pulsedLines, setPulsedLines] = useState<Set<number>>(new Set());

  const addPulsedLines = useCallback((lineNos: number[]) => {
    setPulsedLines((prev) => {
      const newSet = new Set(prev);
      lineNos.forEach((lineNo) => newSet.add(lineNo));
      return newSet;
    });

    setTimeout(() => {
      setPulsedLines((prev) => {
        const newSet = new Set(prev);
        lineNos.forEach((lineNo) => newSet.delete(lineNo));
        return newSet;
      });
    }, 1500);
  }, []);

  return { pulsedLines, addPulsedLines };
};

const useLineToggles = (initialLineToggles: Record<number, boolean>) => {
  const [lineToggles, setLineToggles] =
    useState<Record<number, boolean>>(initialLineToggles);

  const toggleLines = useCallback((lineNos: number[]) => {
    setLineToggles((prev) => {
      const newLineToggles = lineNos.reduce(
        (accum, num) => {
          accum[num] = !accum[num];
          return accum;
        },
        { ...prev } as Record<number, boolean>
      );
      return newLineToggles;
    });
  }, []);

  const clearToggles = useCallback(() => {
    setLineToggles({});
  }, []);

  return { lineToggles, toggleLines, clearToggles };
};

const useScrollAnimation = (toggleLineValue: (lineNos: number[]) => void) => {
  const { actions } = useHighlander();
  const containerRef = useRef<HTMLDivElement>(null);

  const scrollToAndToggle = useCallback(
    async (lineNos: number[]) => {
      if (lineNos.length === 0) return;

      const lowestLineNo = Math.min(...lineNos);
      const targetTop = calculateScrollTarget(containerRef, lowestLineNo);

      if (targetTop !== null && containerRef.current) {
        await smoothScrollTo(containerRef.current, targetTop, 800);
        toggleLineValue(lineNos);
        actions.INCREMENT_ANIMATION();
      }
    },
    [containerRef, toggleLineValue, actions]
  );

  return { scrollToAndToggle, containerRef };
};

function rawLinesFromText(text: string): string[] {
  return text.split("\n");
}

function createTextGroups(
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

function useManageInitialLinesUpdates({
  initialLineToggles,
  lineToggles,
  clearToggles,
  toggleLineValue,
}: {
  initialLineToggles: Record<number, boolean>;
  lineToggles: Record<number, boolean>;
  clearToggles: () => void;
  toggleLineValue: (lineNos: number[]) => void;
}) {
  const { containerRef, scrollToAndToggle } =
    useScrollAnimation(toggleLineValue);

  const prevInitialLineTogglesRef =
    useRef<Record<number, boolean>>(initialLineToggles);

  useEffect(() => {
    const prev = prevInitialLineTogglesRef.current;
    const toggledLineNos = Object.keys(initialLineToggles);

    if (toggledLineNos.length === 0 && Object.keys(lineToggles).length) {
      // TODO: extract this evaluation into a const with a meaningful name
      clearToggles();
      return;
    }

    const newlyToggledLines = toggledLineNos
      .map(Number)
      .filter((lineNo) => initialLineToggles[lineNo] && !prev[lineNo]);

    if (newlyToggledLines.length > 0) {
      // TODO: extract this evaluation into a const with a meaningful name
      setTimeout(() => scrollToAndToggle(newlyToggledLines), 0);
    }

    prevInitialLineTogglesRef.current = initialLineToggles;
  }, [initialLineToggles, lineToggles, clearToggles, scrollToAndToggle]);

  return { containerRef };
}

export function useGetConfigSimulatorContent() {
  const { config } = useSelector(selectPanelState);

  const {
    text,
    title,
    changes,
    initialLineToggles = {},
    showToggleButtons = false,
  } = (config || {}) as ConfigTextProps;

  const { lineToggles, toggleLines, clearToggles } =
    useLineToggles(initialLineToggles);
  const { pulsedLines, addPulsedLines } = usePulsedLines();

  const toggleLineValue = useCallback(
    (lineNos: number[]) => {
      toggleLines(lineNos);
      addPulsedLines(lineNos);
    },
    [toggleLines, addPulsedLines]
  );

  const { containerRef } = useManageInitialLinesUpdates({
    initialLineToggles,
    lineToggles,
    clearToggles,
    toggleLineValue,
  });

  const rawLines = useMemo(() => {
    return rawLinesFromText(text ?? "");
  }, [text]);

  const textGroups = useMemo(() => {
    return createTextGroups(rawLines, changes || [], lineToggles);
  }, [rawLines, changes, lineToggles]);

  return {
    title,
    textGroups,
    pulsedLines,
    containerRef,
    showToggleButtons,
    toggleLineValue,
  };
}
