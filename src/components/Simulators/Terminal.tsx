import { Box } from "@mui/material";
import React, { useEffect, useRef } from "react";
import Typed, { type TypedOptions } from "typed.js";

export interface TerminalTypedOptions extends TypedOptions {
  prompt?: string;
}

export interface TerminalTypedProps {
  typedOptions?: TerminalTypedOptions[];
  style?: React.CSSProperties;
  className?: string;
}

const TERMINAL_PROMPT = "eng@local-terminal > ";
const CURSOR_CHAR = "█";

const terminalAutoLines = [
  "<br/>",
  "<br/>",
  "^700🧪 Deploying synthetic log generators...^450",
  "deployment.apps/mdai-logger-xnoisy created",
  "deployment.apps/mdai-logger-noisy created^450",
  "deployment.apps/mdai-logger created",
  "✅ Log generators deployed",
];

const userEntry = [
  "./MDAI-kind",
  "./mdai-kind .sh",
  "./mdai-kind.sh kif",
  "./mdai-kind.sh logs",
];

export function useTerminalTypedProps() {
  const terminalTypedOptions: TerminalTypedOptions[] = [
    {
      prompt: "eng@local-terminal > ",
      strings: userEntry,
      typeSpeed: 70,
      backSpeed: 150,
      cursorChar: CURSOR_CHAR,
      showCursor: true,
    },
    ...(terminalAutoLines.map((line) => ({
      strings: [line],
      startDelay: 500,
      typeSpeed: 5,
      cursorChar: CURSOR_CHAR,
      showCursor: true,
      contentType: "html",
    })) as TerminalTypedOptions[]),
    {
      prompt: "eng@local-terminal > ",
      strings: [""],
      typeSpeed: 70,
      backSpeed: 150,
      cursorChar: CURSOR_CHAR,
      showCursor: true,
    },
  ];

  return {
    terminalTypedOptions,
    TERMINAL_PROMPT,
    CURSOR_CHAR,
  };
}

export function Terminal({
  typedOptions: typedOptionsProp,
  className,
}: TerminalTypedProps) {
  const { terminalTypedOptions } = useTerminalTypedProps();

  const elementsRef = useRef<(HTMLPreElement | null)[]>([]);
  const typedInstancesRef = useRef<(Typed | null)[]>([]);
  const promptElementsRef = useRef<(HTMLPreElement | null)[]>([]);

  const typedOptions = typedOptionsProp || terminalTypedOptions;

  useEffect(() => {
    typedOptions.forEach((options, index) => {
      const element = elementsRef.current[index];
      if (element) {
        const { prompt, ...typedJsOptions } = options;

        const originalOnComplete = typedJsOptions.onComplete;
        const wrappedOptions = {
          ...typedJsOptions,
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
  }, [typedOptions]);

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
