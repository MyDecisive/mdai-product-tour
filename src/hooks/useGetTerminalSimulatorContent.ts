import { useEffect, useRef, useState } from "react";
import Typed from "typed.js";
import { selectPanelState } from "../contexts/selectors";
import type { TerminalTypedProps } from "../utils/types";
import { useHighlander } from "./useHighlander";
import { useSelector } from "./useSelector";

export function useGetTerminalSimulatorContent() {
  const { terminal = {} } = useSelector(selectPanelState);
  const { actions } = useHighlander();

  const { typedOptions = [] } = terminal as TerminalTypedProps;
  const elementsRef = useRef<(HTMLPreElement | null)[]>([]);
  const typedInstancesRef = useRef<(Typed | null)[]>([]);
  const containerElementRef = useRef<HTMLDivElement | null>(null);

  const [workDone, setWorkDone] = useState<boolean>(false);

  useEffect(() => {
    typedOptions.forEach((options, index) => {
      const element = elementsRef.current[index];
      if (element) {
        const originalOnComplete = options.onComplete;
        const wrappedOptions = {
          ...options,
          onBegin: (typed: Typed) => {
            if (!options.strings) {
              typed.stop();
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
              console.log("terminal increment animation");
              actions.INCREMENT_ANIMATION();
              setWorkDone(true);
            }
          },
        };

        const typed = new Typed(element, wrappedOptions);

        if (index === 0) {
          if (typed.cursor) {
            typed.cursor.style.display = "inline-block";
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
  }, [typedOptions, actions]);

  useEffect(() => {
    if (!workDone && containerElementRef.current) {
      containerElementRef.current.scrollTop =
        containerElementRef.current.scrollHeight;
    }
  }, [elementsRef.current, workDone]);

  useEffect(() => {
    setWorkDone(() => false);
  }, [JSON.stringify(typedOptions)]);

  return {
    typedOptions,
    elementsRef,
    containerElementRef,
  };
}
