import { useEffect, useRef } from "react";
import Typed from "typed.js";
import { SIMULATORS } from "../utils/constants";
import { createTerminalContent } from "../utils/transformHelpers";
import type { SimulatorType, TerminalTypedOptions } from "../utils/types";

export function parseTypedJsString(str: string) {
  return str.replaceAll(/`/gi, "").replaceAll(/\^\d+/gi, "");
}

// TODO: Move these prop types to a types file
interface TerminalProps {
  state: TerminalTypedOptions[] | null | undefined;
  playing: boolean;
  onAnimationComplete: (sim?: SimulatorType) => void;
  onTerminalContentPrinted: (index: number) => void;
}

export function useGetTerminalSimulatorContent({
  state,
  playing,
  onAnimationComplete,
  onTerminalContentPrinted,
}: TerminalProps) {
  const activeElementRef = useRef<HTMLPreElement | null>(null);
  const typedInstanceRef = useRef<Typed | null>(null);
  const containerElementRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!state || state.length === 0) {
      typedInstanceRef.current?.destroy();
      typedInstanceRef.current = null;
      return;
    }

    const currentIndex = state.findIndex((opt) => !opt.printed);
    if (currentIndex === -1 || !activeElementRef.current) return;

    const options = state[currentIndex];
    const isLast = currentIndex === state.length - 1;

    typedInstanceRef.current?.destroy();
    typedInstanceRef.current = new Typed(activeElementRef.current, {
      ...options,
      onBegin: (typed: Typed) => {
        if (!playing) {
          typed.stop();
          if (options.strings) {
            activeElementRef.current!.innerHTML = options.strings
              .map(parseTypedJsString)
              .join("\n");
          }
        }
      },
      preStringTyped: (_: number, typed: Typed) => {
        if (typed.cursor) {
          typed.cursor.style.display = "none";
        }
      },
      onTypingPaused: (_: number, typed: Typed) => {
        if (typed.cursor && options.showCursor) {
          typed.cursor.style.display = "inline-block";
          typed.cursor.classList.add("typed-cursor--blink");
        }
      },
      onTypingResumed: (_: number, typed: Typed) => {
        if (typed.cursor) {
          typed.cursor.style.display = "none";
        }
      },
      onComplete: (typed: Typed) => {
        options.onComplete?.(typed);
        onTerminalContentPrinted(currentIndex);

        if (isLast) {
          onAnimationComplete(SIMULATORS.TERMINAL);
        }
      },
    });

    if (!playing) {
      typedInstanceRef.current.stop();
    }

    return () => {
      typedInstanceRef.current?.destroy();
      typedInstanceRef.current = null;
    };
  }, [state, playing, onAnimationComplete, onTerminalContentPrinted]);

  useEffect(() => {
    if (playing && containerElementRef.current) {
      containerElementRef.current.scrollTop =
        containerElementRef.current.scrollHeight;
    }
    if (!playing) {
      typedInstanceRef.current?.stop();
    }
  }, [playing]);

  const currentItem = state?.find((opt) => !opt.printed);
  const completedItems = state?.filter((opt) => opt.printed) ?? [];

  if (!currentItem) {
    completedItems.push(createTerminalContent([""], true)[0]);
  }

  return {
    completedItems,
    currentItem,
    activeElementRef,
    containerElementRef,
  };
}
