import { useEffect, useMemo, useRef, useState } from "react";
import { selectPanelState } from "../contexts/selectors";
import type { ConfigTextProps } from "../utils/types";
import { useHighlander } from "./useHighlander";
import { useSelector } from "./useSelector";

export function useGetConfigSimulatorContent() {
  const { config = {} } = useSelector(selectPanelState);
  const { actions } = useHighlander();

  const { text, activeRange, title } = config as ConfigTextProps;

  const containerRef = useRef<HTMLDivElement>(null);
  const lines = useMemo(() => (text ?? "").split("\n"), [text]);

  const [workDone, setWorkDone] = useState<boolean>(false);

  useEffect(() => {
    if (!workDone) {
      if (!activeRange) {
        containerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      const el = containerRef.current?.querySelector<HTMLDivElement>(
        `[data-line="${activeRange.start - 1}"]`
      );
      el?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [activeRange, workDone]);

  useEffect(() => {
    setWorkDone(false);
  }, [activeRange?.start, activeRange?.end, text, title]);

  return {
    title,
    lines,
    containerRef,
    activeRange,
    onScrollEnd: () => {
      actions.INCREMENT_ANIMATION();
      setWorkDone(true);
    },
  };
}
