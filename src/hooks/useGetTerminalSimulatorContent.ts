import { useEffect, useRef } from "react";
import Typed from "typed.js";
import { parseTypedJsString } from "../utils/strings";
import type { TerminalTypedProps } from "../utils/types";

interface TerminalProps {
  state: TerminalTypedProps | null | undefined;
  playing: boolean;
  onAnimationComplete: () => void;
}

export function useGetTerminalSimulatorContent({
  state,
  playing,
  onAnimationComplete,
}: TerminalProps) {
  const elementsRef = useRef<(HTMLPreElement | null)[]>([]);
  const typedInstancesRef = useRef<(Typed | null)[]>([]);
  const containerElementRef = useRef<HTMLDivElement | null>(null);

  const typedOptions = state?.typedOptions || [];

  useEffect(() => {
    if (typedOptions.length === 0) {
      typedInstancesRef.current.forEach((typed) => {
        if (typed) {
          typed.destroy();
        }
      });
      typedInstancesRef.current = [];
      return;
    }

    typedOptions.forEach((options, index) => {
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
              if (index !== typedOptions.length - 1) {
                typed.cursor.style.display = "none";
              }
              if (index === typedOptions.length - 1 && options.showCursor) {
                typed.cursor.style.display = "inline-block";
              }
            }

            const nextIndex = index + 1;
            if (nextIndex < typedOptions.length) {
              const nextTyped = typedInstancesRef.current[nextIndex];
              if (nextTyped && nextTyped.cursor) {
                nextTyped.cursor.style.display = "inline-block";
                nextTyped.start();
              }
            }
            if (index === typedOptions.length - 1) {
              onAnimationComplete();
            }
          },
        };

        const typed = new Typed(element, wrappedOptions);

        if (index === 0) {
          if (typed.cursor) {
            typed.cursor.style.display = playing ? "inline-block" : "none";
          }
        } else {
          typed.stop();
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
  }, [typedOptions, onAnimationComplete, playing]);

  useEffect(() => {
    if (playing && containerElementRef.current) {
      containerElementRef.current.scrollTop =
        containerElementRef.current.scrollHeight;
    }
  }, [containerElementRef.current, playing]);

  return {
    typedOptions,
    elementsRef,
    containerElementRef,
  };
}
