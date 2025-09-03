import { useEffect, useRef, useState } from "react";
import type { LineRange, SimAction, SimScript } from "../utils/types";

export type PanelState = {
  config: { text: string; href?: string; range?: LineRange; name?: string };
  terminal: { lines: string[] };
  status: { value: string | string[] | Record<string, unknown> | null };
  logs: { lines: string[] };
};

const INITIAL: PanelState = {
  config: { text: "", href: undefined, range: undefined, name: undefined },
  terminal: { lines: [] },
  status: { value: null },
  logs: { lines: [] },
};

export function useSimRunner(script: SimScript | undefined) {
  const [state, setState] = useState<PanelState>(INITIAL);
  const playId = useRef(0);

  useEffect(() => {
    playId.current++;
    const id = playId.current;
    setState(INITIAL);

    if (!script || script.length === 0) return;

    let now = 0;
    const timers: number[] = [];

    const schedule = (action: SimAction) => {
      if (action.t != null) now = action.t;
      if (action.delay != null) now += action.delay;

      const timer = window.setTimeout(() => {
        if (playId.current !== id) return; // canceled
        setState((s) => reduceAction(s, action));
      }, now);
      timers.push(timer);
    };

    script.forEach(schedule);
    return () => {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      playId.current++;
      timers.forEach(clearTimeout);
    };
  }, [script]);

  return state;
}

function reduceAction(prev: PanelState, a: SimAction): PanelState {
  switch (a.simType) {
    case "config.show":
      return {
        ...prev,
        config: {
          text: a.text ?? a.configFile ?? prev.config.text,
          href: a.href ?? prev.config.href,
          range: a.range,
          name: a.configName ?? prev.config.name,
        },
      };

    case "terminal.run":
      return {
        ...prev,
        terminal: { lines: [...prev.terminal.lines, `$ ${a.cmd}`] },
      };

    case "terminal.out":
      return {
        ...prev,
        terminal: { lines: [...prev.terminal.lines, a.text] },
      };

    case "status.set":
      return { ...prev, status: { value: a.text } };

    case "logs.append":
      return { ...prev, logs: { lines: [...prev.logs.lines, ...a.lines] } };

    case "wait":
    default:
      return prev;
  }
}