import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { selectPanelState } from "../contexts/selectors";
import type {
  ConfigTextProps,
  LineChangeBlock,
  ProcessedLine,
} from "../utils/types";
import { useHighlander } from "./useHighlander";
import { useSelector } from "./useSelector";

function fillHighlightRanges(
  highlights: LineChangeBlock[],
  maxEndIdx: number
): Set<number> {
  const highlightSet = new Set<number>();

  highlights?.forEach(({ start, end }) => {
    for (let i = start; i <= (end || maxEndIdx); i++) {
      highlightSet.add(i);
    }
  });

  return highlightSet;
}

function smoothScrollTo(
  element: HTMLElement,
  targetTop: number,
  duration: number = 1000
): Promise<void> {
  return new Promise((resolve) => {
    const startTop = element.scrollTop;
    const distance = targetTop - startTop;
    const startTime = performance.now();

    function animate(currentTime: number) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function (ease-in-out)
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
    }

    requestAnimationFrame(animate);
  });
}

function getYamlParents(lines: string[], lineNo: number): number[] {
  const parents: number[] = [];
  let targetIndent = lines[lineNo - 1]?.match(/^(\s*)/)?.[1]?.length ?? 0;

  // Work backwards to find parent lines with less indentation
  for (let i = lineNo - 2; i >= 0; i--) {
    const line = lines[i];
    if (!line?.trim() || line.trim().startsWith("#")) continue;

    const indent = line.match(/^(\s*)/)?.[1]?.length ?? 0;

    // If this line has less indentation and contains a key, it's a parent
    if (indent < targetIndent && line.includes(":")) {
      parents.unshift(i + 1);

      // Update target indent to find grandparents
      targetIndent = indent;
      if (indent === 0) break;
    }
  }

  return parents;
}

function groupConsecutiveChanges(processedLines: ProcessedLine[]) {
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
    const isCurrentLineChanged = line.isHighlighted;
    const isNextLineChanged = nextLine?.isHighlighted;
    const isConsecutive = nextLine && nextLine.lineNo === line.lineNo + 1;

    currentGroup.push(line);

    // End current group if:
    // - This is the last line, OR
    // - Next line is not consecutive, OR
    // - Change state is switching (changed->unchanged or vice versa)
    if (
      !nextLine ||
      !isConsecutive ||
      isCurrentLineChanged !== isNextLineChanged
    ) {
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
}

function extractRelevantSections(
  lines: string[],
  changes: LineChangeBlock[],
  contextLines = 2
): Array<{ lines: string[]; startLineNo: number; isGap: boolean }> {
  if (
    !changes?.length ||
    !lines.length ||
    (lines.length === 1 && lines[0] === "")
  )
    return [];

  const relevantLines = new Set<number>();

  changes.forEach(({ start, end = lines.length + 1 }) => {
    for (let i = start; i <= end; i++) {
      relevantLines.add(i);

      getYamlParents(lines, i).forEach((parentLine) => {
        relevantLines.add(parentLine);
      });
    }

    for (
      let i = Math.max(1, start - contextLines);
      i <= Math.min(lines.length, end + contextLines);
      i++
    ) {
      if (lines[i].trim() === "") {
        break;
      }
      relevantLines.add(i);
    }
  });

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
      const startLineNo = currentSection[0];
      const sectionLines = currentSection.map((num) => lines[num - 1]);
      sections.push({ lines: sectionLines, startLineNo, isGap: false });

      if (nextLineNo) {
        const lineBeforeGap = sectionLines[sectionLines.length - 1];
        const indentSpacesCount =
          lineBeforeGap?.match(/^(\s*)/)?.[1]?.length ?? 0;

        const indent = " ".repeat(indentSpacesCount + 2);
        sections.push({
          lines: [`${indent}...`],
          startLineNo: lineNo + 1,
          isGap: true,
        });
      }

      currentSection = [];
    }
  });

  return sections;
}

export function useGetConfigSimulatorContent() {
  const { config } = useSelector(selectPanelState);
  const { actions } = useHighlander();

  const {
    text,
    title,
    changes,
    initialLineToggles = {},
    showToggleButtons = false,
  } = (config || {}) as ConfigTextProps;

  const [lineToggles, setLineToggles] =
    useState<Record<number, boolean>>(initialLineToggles);

  const [pulsedLines, setPulsedLines] = useState<Set<number>>(new Set());

  const containerRef = useRef<HTMLDivElement>(null);
  const isScrollingRef = useRef(false);

  const prevInitialLineTogglesRef =
    useRef<Record<number, boolean>>(initialLineToggles);

  const toggleLineValue = useCallback((lineNos: number[]) => {
    setLineToggles((prev: Record<number, boolean>) => {
      const newLineToggles = lineNos.reduce(
        (accum, num) => {
          accum[num] = !accum[num];

          return accum;
        },
        { ...prev } as Record<number, boolean>
      );
      return newLineToggles;
    });

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

  useEffect(() => {
    const prev = prevInitialLineTogglesRef.current;

    const toggledLineNos = Object.keys(initialLineToggles);

    if (toggledLineNos.length === 0 && Object.keys(lineToggles).length) {
      setLineToggles({});
      return;
    }

    const newlyToggledLines = toggledLineNos
      .map(Number)
      .filter((lineNo) => initialLineToggles[lineNo] && !prev[lineNo]);

    if (newlyToggledLines.length > 0 && !isScrollingRef.current) {
      const lowestLineNo = Math.min(...newlyToggledLines);

      setTimeout(() => {
        const el = containerRef.current?.querySelector<HTMLDivElement>(
          `[data-line="${lowestLineNo}"]`
        );

        if (el && containerRef.current) {
          const containerRect = containerRef.current.getBoundingClientRect();
          const elementRect = el.getBoundingClientRect();
          const targetTop =
            containerRef.current.scrollTop +
            (elementRect.top - containerRect.top) -
            24;

          smoothScrollTo(containerRef.current, targetTop, 800)
            .then(() => {
              toggleLineValue(newlyToggledLines);
            })
            .then(() => {
              actions.INCREMENT_ANIMATION();
            });
        }
      }, 0);
    }

    prevInitialLineTogglesRef.current = initialLineToggles;
  }, [initialLineToggles, actions, lineToggles]);

  const processedSections = useMemo(() => {
    const rawLines = (text ?? "").split("\n");
    const sections = extractRelevantSections(rawLines, changes || []);

    const changeMap = new Map<number, string>();
    changes?.forEach((block) => {
      block.oldValues.forEach((oldValue, index) => {
        const lineNo = block.start + index;
        changeMap.set(lineNo, oldValue);
      });
    });

    const highlightRanges = fillHighlightRanges(changes || [], rawLines.length);

    const processed = sections.map((section) => ({
      ...section,
      processedLines: section.lines.map((line, i) => {
        const lineNo = section.startLineNo + i;
        const change = changeMap.get(lineNo);
        const showingNew = !!lineToggles[lineNo];

        if (change !== undefined) {
          return {
            lineNo,
            content: change,
            isHighlighted: highlightRanges.has(lineNo),
            newValue: line,
            showingNewValue: showingNew,
            isGap: section.isGap,
          };
        }

        return {
          lineNo,
          content: line,
          isHighlighted: false,
          showingNewValue: false,
          isGap: section.isGap,
        };
      }),
    }));

    return processed;
  }, [text, changes, lineToggles]);

  const textGroups = processedSections.flatMap((section, sectionIndex) =>
    groupConsecutiveChanges(section.processedLines).map(
      (group, groupIndex) => ({
        ...group,
        sectionIndex,
        groupIndex,
      })
    )
  );

  return {
    title,
    textGroups,
    pulsedLines,
    containerRef,
    showToggleButtons,
    toggleLineValue,
  };
}
