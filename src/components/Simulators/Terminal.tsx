import { Box } from "@mui/material";
import { useEffect, useRef } from "react";
import Typed from "typed.js";
import { useGetTerminalSimulatorContent } from "../../hooks/useGetTerminalSimulatorContent";

export function Terminal() {
  const {
    incrementAnimation,
    typedOptions = [],
    className,
  } = useGetTerminalSimulatorContent();
  const elementsRef = useRef<(HTMLPreElement | null)[]>([]);
  const typedInstancesRef = useRef<(Typed | null)[]>([]);
  const promptElementsRef = useRef<(HTMLPreElement | null)[]>([]);

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
              incrementAnimation();
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
  }, [typedOptions, incrementAnimation]);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        height: "100%",
        width: "100%",
        flex: 1,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "flex-start" }}>
        <div style={{ display: "inline" }} className={className}>
          {typedOptions.map((options, index) => (
            <div
              key={index}
              style={{
                display: "flex",
                alignItems: "flex-end",
                lineHeight: "1.5em",
              }}
            >
              {options.prompt && (
                <pre
                  ref={(el) => {
                    promptElementsRef.current[index] = el;
                  }}
                  style={{
                    margin: 0,
                    lineHeight: "1.5em",
                    display: index === 0 ? "inline" : "none", // Hide all prompts except first
                  }}
                >
                  {options.prompt}
                </pre>
              )}
              <pre
                ref={(el) => {
                  elementsRef.current[index] = el;
                }}
                style={{ margin: 0, lineHeight: "1.5em", display: "inline" }}
              />
            </div>
          ))}
        </div>
      </Box>
    </Box>
  );
}
