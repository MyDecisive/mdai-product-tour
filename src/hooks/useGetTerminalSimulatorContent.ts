import { useEffect, useRef } from "react";
import Typed from "typed.js";
import { SIMULATORS } from "../utils/constants";
import { parseTypedJsString } from "../utils/strings";
import type { SimulatorType, TerminalTypedOptions } from "../utils/types";

// TODO: Move these prop types to a types file
interface TerminalProps {
  state: TerminalTypedOptions[] | null | undefined;
  playing: boolean;
  onAnimationComplete: (sim?: SimulatorType) => void;
}

export function useGetTerminalSimulatorContent({
  state,
  playing,
  onAnimationComplete,
}: TerminalProps) {
  const elementsRef = useRef<(HTMLPreElement | null)[]>([]);
  const typedInstancesRef = useRef<(Typed | null)[]>([]);
  const containerElementRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!state || state?.length === 0) {
      typedInstancesRef.current.forEach((typed) => {
        if (typed) {
          typed.destroy();
        }
      });
      typedInstancesRef.current = [];
      return;
    }

    state.forEach((options, index) => {
      const element = elementsRef.current[index];
      if (element) {
        const originalOnComplete = options.onComplete?.bind(options);

        const wrappedOptions = {
          ...options,
          onBegin: (typed: Typed) => {
            if (!options.strings || !playing) {
              typed.stop();

              if (options.strings && !playing) {
                element.innerHTML = options.strings
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
            if (originalOnComplete) {
              originalOnComplete(typed);
            }

            if (typed.cursor) {
              if (index !== state.length - 1) {
                typed.cursor.style.display = "none";
              }
              if (index === state.length - 1 && options.showCursor) {
                typed.cursor.style.display = "inline-block";
              }
            }

            const nextIndex = index + 1;
            if (nextIndex < state.length) {
              const nextTyped = typedInstancesRef.current[nextIndex];
              const nextEle = elementsRef.current[nextIndex];
              if (nextEle && nextEle.style.display === "none") {
                nextEle.style.display = "inline-block";
                nextEle.parentElement!.style.height = "20px";
              }
              if (nextTyped && nextTyped.cursor) {
                nextTyped.cursor.style.display = "inline-block";
                nextTyped.start();
              }
            }
            if (index === state.length - 1) {
              onAnimationComplete(SIMULATORS.TERMINAL);
            }
          },
        };

        const typed = new Typed(element, wrappedOptions);

        if (index === 0) {
          if (typed.cursor) {
            typed.cursor.style.display = playing ? "inline-block" : "none";
          }
          element.parentElement!.style.height = "20px";
        } else {
          typed.stop();
          element.style.display = playing ? "none" : "inline-block";
          if (typed.cursor) {
            typed.cursor.style.display = "none";
          }
        }
        typedInstancesRef.current[index] = typed;
      }
    });

    return () => {
      typedInstancesRef.current.forEach((typed) => {
        if (typed) {
          typed.destroy();
        }
      });
      typedInstancesRef.current = [];
    };
  }, [state, onAnimationComplete, playing]);

  useEffect(() => {
    if (playing && containerElementRef.current) {
      containerElementRef.current.scrollTop =
        containerElementRef.current.scrollHeight;
    }
  }, [playing]);

  return {
    typedOptions: state ?? [],
    elementsRef,
    containerElementRef,
  };
}
