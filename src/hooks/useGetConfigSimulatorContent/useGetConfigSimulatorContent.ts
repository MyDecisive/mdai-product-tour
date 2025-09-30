import {
  createRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { selectActiveTab, selectPanelState } from "../../contexts/selectors";
import type {
  ConfigTextProps,
  FileConfig,
  LineChangeBlock,
  LineToggles,
  ProcessedLine,
  TextGroup,
} from "../../utils/types";
import { useHighlander } from "../useHighlander";
import { useSelector } from "../useSelector";

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
  let cancelled = false;
  let rafId: number;

  const promise = new Promise<void>((resolve) => {
    const startTop = element.scrollTop;
    const distance = targetTop - startTop;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      if (cancelled) return;
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      const easeInOut =
        progress < 0.5
          ? 2 * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;

      element.scrollTop = startTop + distance * easeInOut;

      if (progress < 1) {
        rafId = requestAnimationFrame(animate);
      } else {
        resolve();
      }
    };

    rafId = requestAnimationFrame(animate);
  });

  (promise as Promise<void> & { cancel: () => void }).cancel = () => {
    cancelled = true;
    if (rafId) {
      cancelAnimationFrame(rafId);
    }
  };

  return promise;
};

const SCROLL_PADDING_TOP = 24;

const calculateScrollTarget = (
  containerRef: HTMLDivElement | null,
  lineNo: number
): number | null => {
  const el = containerRef?.querySelector<HTMLDivElement>(
    `[data-line="${lineNo}"]`
  );

  if (!el || !containerRef) return null;

  const containerRect = containerRef.getBoundingClientRect();
  const elementRect = el.getBoundingClientRect();

  return (
    containerRef.scrollTop +
    (elementRect.top - containerRect.top) -
    SCROLL_PADDING_TOP
  );
};

const usePulsedLines = (fileNames: string[]) => {
  const [pulsedLines, setPulsedLines] = useState<Record<string, Set<number>>>(
    fileNames.reduce((accum, name) => {
      accum[name] = new Set();

      return accum;
    }, {} as Record<string, Set<number>>)
  );

  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);

  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach(clearTimeout);
      timeoutsRef.current = [];
    };
  }, []);

  useEffect(() => {
    setPulsedLines((old) => {
      const newState = fileNames.reduce((accum, name) => {
        accum[name] = old[name] || new Set();
        return accum;
      }, {} as Record<string, Set<number>>);
      return newState;
    });
  }, [fileNames]);

  const addPulsedLines = useCallback((fileName: string, lineNos: number[]) => {
    if (!lineNos.length) {
      return;
    }
    setPulsedLines((prev) => {
      const newState = { ...prev };

      if (!newState[fileName]) {
        newState[fileName] = new Set<number>();
      }

      lineNos.forEach((lineNo) => newState[fileName].add(lineNo));
      return newState;
    });

    const timeoutId = setTimeout(() => {
      setPulsedLines((prev) => {
        const newState = { ...prev };
        lineNos.forEach((lineNo) => newState[fileName].delete(lineNo));
        return newState;
      });
    }, 1500);
    timeoutsRef.current.push(timeoutId);
  }, []);

  return { pulsedLines, addPulsedLines };
};

function initialTogglesForAllFiles(files: Record<string, FileConfig>) {
  return Object.entries(files).reduce((accum, [key, file]) => {
    accum[key] = file.initialLineToggles || {};
    return accum;
  }, {} as Record<string, LineToggles>);
}

const useLineToggles = (files: Record<string, FileConfig>) => {
  const [lineToggles, setLineToggles] = useState<Record<string, LineToggles>>(
    () => {
      return initialTogglesForAllFiles(files);
    }
  );

  useEffect(() => {
    setLineToggles(initialTogglesForAllFiles(files));
  }, [files]);

  const toggleLines = useCallback((fileName: string, lineNos: number[]) => {
    setLineToggles((prev) => ({
      ...prev,
      [fileName]: {
        ...prev[fileName],
        ...lineNos.reduce((toggles, num) => {
          toggles[num] = !prev[fileName]?.[num];
          return toggles;
        }, {} as LineToggles),
      },
    }));
  }, []);

  const resetToggles = useCallback(() => {
    setLineToggles(initialTogglesForAllFiles(files));
  }, [files]);

  return { lineToggles, toggleLines, resetToggles };
};

const useScrollAnimation = (
  fileNames: string[],
  toggleLineValue: (fileName: string, lineNos: number[]) => void
) => {
  const { actions } = useHighlander();
  const containerRefs = useRef<
    Record<string, React.RefObject<HTMLDivElement | null>>
  >({});

  useEffect(() => {
    const newRefs: Record<string, React.RefObject<HTMLDivElement | null>> = {};
    fileNames.forEach((name) => {
      // Preserve existing refs or create new ones
      newRefs[name] =
        containerRefs.current[name] || createRef<HTMLDivElement>();
    });
    containerRefs.current = newRefs;
  }, [fileNames]);

  const scrollToAndToggle = useCallback(
    async (fileName: string, lineNos: number[]) => {
      if (lineNos.length === 0) return;

      const lowestLineNo = Math.min(...lineNos);
      const ref = containerRefs.current[fileName].current;
      const targetTop = calculateScrollTarget(ref, lowestLineNo);

      if (targetTop !== null && ref) {
        await smoothScrollTo(ref, targetTop, 800);
        toggleLineValue(fileName, lineNos);
        actions.INCREMENT_ANIMATION();
      }
    },
    [containerRefs, toggleLineValue, actions]
  );

  return { scrollToAndToggle, containerRefs };
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
  activeFileTitle,
  files,
  fileNames,
  lineToggles,
  resetToggles,
  toggleLineValue,
}: {
  activeFileTitle?: string;
  files: Record<string, FileConfig>;
  fileNames: string[];
  lineToggles: Record<string, LineToggles>;
  resetToggles: () => void;
  toggleLineValue: (fileName: string, lineNos: number[]) => void;
}) {
  const { containerRefs, scrollToAndToggle } = useScrollAnimation(
    fileNames,
    toggleLineValue
  );

  const prevInitialLineTogglesRef = useRef<Record<string, LineToggles>>(
    initialTogglesForAllFiles(files)
  );

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    let scrollPromise: Promise<void> & { cancel?: () => void };
    if (!activeFileTitle) {
      return;
    }
    const prev = prevInitialLineTogglesRef.current[activeFileTitle];
    const toggledLineNos = Object.keys(
      files[activeFileTitle]?.initialLineToggles || {}
    );

    const currentLineTogglesAreObsolete =
      toggledLineNos.length === 0 &&
      lineToggles[activeFileTitle] &&
      Object.keys(lineToggles[activeFileTitle]).length;
    if (currentLineTogglesAreObsolete) {
      resetToggles();
      return;
    }

    const newlyToggledLines = toggledLineNos
      .map(Number)
      .filter(
        (lineNo) =>
          files[activeFileTitle].initialLineToggles![lineNo] && !prev?.[lineNo]
      );

    const mustScrollAndToggle = newlyToggledLines.length > 0;
    if (mustScrollAndToggle) {
      timeout = setTimeout(() => {
        scrollPromise = scrollToAndToggle(activeFileTitle, newlyToggledLines);
      }, 0);
    }

    prevInitialLineTogglesRef.current = {
      ...prevInitialLineTogglesRef.current,
      [activeFileTitle]: files[activeFileTitle]?.initialLineToggles || {},
    };

    return () => {
      clearTimeout(timeout);
      if (
        typeof scrollPromise !== "undefined" &&
        typeof scrollPromise.cancel === "function"
      ) {
        scrollPromise.cancel();
      }
    };
  }, [files, lineToggles, resetToggles, scrollToAndToggle, activeFileTitle]);

  return { containerRefs };
}

export function useGetConfigSimulatorContent() {
  const { config } = useSelector(selectPanelState);
  const { actions } = useHighlander();
  const activeTab = useSelector(selectActiveTab);

  const setActiveTab = useCallback(
    (tab?: string) => {
      actions.SET_ACTIVE_TAB(tab);
    },
    [actions]
  );

  const { files = {}, activeFileTitle } = (config || {}) as ConfigTextProps;

  const fileKeys = useMemo(() => {
    const keysArr = Object.keys(files);
    if (keysArr.length === 0) {
      return "empty";
    }
    return keysArr.sort().join(",");
  }, [files]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const fileNames = useMemo(() => Object.keys(files), [fileKeys]);

  const { lineToggles, toggleLines, resetToggles } = useLineToggles(files);
  const { pulsedLines, addPulsedLines } = usePulsedLines(fileNames);

  useEffect(() => {
    setActiveTab(activeFileTitle);
  }, [activeFileTitle, setActiveTab]);

  const toggleLineValue = useCallback(
    (fileName: string, lineNos: number[]) => {
      toggleLines(fileName, lineNos);
      addPulsedLines(fileName, lineNos);
    },
    [toggleLines, addPulsedLines]
  );

  const { containerRefs } = useManageInitialLinesUpdates({
    activeFileTitle: activeTab,
    files,
    fileNames,
    lineToggles,
    resetToggles,
    toggleLineValue,
  });

  const fileTexts = useMemo(() => {
    return Object.values(files).map((file) => file.text ?? "");
  }, [files]);

  const rawLinesByFile = useMemo(() => {
    console.log("Recalculating raw lines for all files...");
    return Object.entries(files).reduce((accum, [fileName, { text }]) => {
      accum[fileName] = rawLinesFromText(text ?? "");
      return accum;
    }, {} as Record<string, string[]>);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fileTexts]);

  const stableChanges = useMemo(() => {
    return JSON.stringify(
      Object.values(files).map((file) => file.changes || [])
    );
  }, [files]);

  const stableToggles = useMemo(
    () => JSON.stringify(lineToggles),
    [lineToggles]
  );

  const textGroupsByFile = useMemo(() => {
    console.log("Recalculating text groups for all files...");
    return Object.entries(files).reduce((accum, [fileName, fileConfig]) => {
      accum[fileName] = createTextGroups(
        rawLinesByFile[fileName] || [],
        fileConfig.changes || [],
        lineToggles[fileName] || {}
      );
      return accum;
    }, {} as Record<string, TextGroup[]>);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rawLinesByFile, stableChanges, stableToggles, lineToggles]);

  const fileMetadata = useMemo(() => {
    return Object.entries(files).map(([name, config]) => ({
      title: name,
      href: config.href,
      showToggleButtons: config.showToggleButtons,
    }));
  }, [files]);

  const tabContents = useMemo(() => {
    // console.log("Recalculating tab contents..."); // For debugging
    return fileMetadata.map(({ title, href, showToggleButtons }) => ({
      title,
      href,
      showToggleButtons,
      textGroups: textGroupsByFile[title],
      pulsedLines: pulsedLines[title] || new Set(),
      containerRef: containerRefs.current[title],
      toggleLineValue: (lineNos: number[]) => toggleLineValue(title, lineNos),
    }));
  }, [
    fileMetadata,
    textGroupsByFile,
    pulsedLines,
    containerRefs,
    toggleLineValue,
  ]);

  return {
    tabContents,
    activeTab: activeTab || activeFileTitle || tabContents[0]?.title || "",
    setActiveTab,
  };
}
