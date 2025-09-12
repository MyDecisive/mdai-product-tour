import { useEffect, useRef } from "react";
import Typed from "typed.js";
import { selectPanelState } from "../contexts/selectors";
import type { TerminalTypedProps } from "../utils/types";
import { useHighlander } from "./useHighlander";
import { useSelector } from "./useSelector";

export function useGetTerminalSimulatorContent() {
  const { terminal = {} } = useSelector(selectPanelState);
  const { actions } = useHighlander();

  const { typedOptions = [], className } = terminal as TerminalTypedProps;
  const elementsRef = useRef<(HTMLPreElement | null)[]>([]);
  const typedInstancesRef = useRef<(Typed | null)[]>([]);
  const promptElementsRef = useRef<(HTMLPreElement | null)[]>([]);
  const containerElementRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    typedOptions.forEach((options, index) => {
      const element = elementsRef.current[index];
      if (element) {
        const originalOnComplete = options.onComplete;
        const wrappedOptions = {
          ...options,
          onComplete: (typed: Typed) => {
            if (originalOnComplete) {
              originalOnComplete(typed);
            }

            if (typed.cursor && index !== typedOptions.length - 1) {
              typed.cursor.style.display = "none";
            }

            const nextIndex = index + 1;
            if (nextIndex < typedOptions.length) {
              const nextPromptElement = promptElementsRef.current[nextIndex];
              if (nextPromptElement) {
                nextPromptElement.style.display = "inline";
              }

              const nextTyped = typedInstancesRef.current[nextIndex];
              if (nextTyped && nextTyped.cursor) {
                nextTyped.cursor.style.display = "inline-block";
                nextTyped.start();
              }
            }
            if (index === typedOptions.length - 1) {
              actions.INCREMENT_ANIMATION();
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
    if (containerElementRef.current) {
      containerElementRef.current.scrollTop =
        containerElementRef.current.scrollHeight;
    }
  }, [elementsRef.current]);

  return {
    typedOptions,
    promptElementsRef,
    elementsRef,
    className,
    containerElementRef,
  };
}
