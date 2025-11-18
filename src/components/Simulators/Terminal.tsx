/** @jsx jsx */
import { Box } from "@mui/material";
import {
  parseTypedJsString,
  useGetTerminalSimulatorContent,
} from "../../hooks/useGetTerminalSimulatorContent";
import {
  type SimulatorType,
  type TerminalTypedOptions,
} from "../../utils/types";

interface TerminalProps {
  state: TerminalTypedOptions[] | null | undefined;
  playing: boolean;
  onAnimationComplete: (sim?: SimulatorType) => void;
  onTerminalContentPrinted: (index: number) => void;
}

export function Terminal({
  state,
  playing,
  onAnimationComplete,
  onTerminalContentPrinted,
}: TerminalProps) {
  const { completedItems, currentItem, activeElementRef, containerElementRef } =
    useGetTerminalSimulatorContent({
      state,
      playing,
      onAnimationComplete,
      onTerminalContentPrinted,
    });

  return (
    <Box
      sx={{
        height: "100%",
        width: "100%",
        maxHeight: "350px",
        overflowY: "auto",
        display: "flex",
        flexDirection: "column-reverse",
        alignItems: "flex-start",
        flex: 1,
      }}
      ref={containerElementRef}
    >
      <div
        style={{
          display: "inline-flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          width: "100%",
        }}
      >
        {completedItems.map((item, i) => (
          <div
            key={`${i}-completed-${item.strings?.[0] ?? "empty"}`}
            style={{
              display: "flex",
              alignItems: "flex-end",
              height: "fit-content",
              minHeight: "20px",
            }}
          >
            <pre
              style={{
                margin: 0,
                lineHeight: "1.25rem",
                display: "inline",
                wordWrap: "break-word",
                whiteSpace: "break-spaces",
              }}
            >
              {item.strings?.map(parseTypedJsString).join("\n")}
            </pre>
          </div>
        ))}
        {currentItem && (
          <div
            css={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "flex-start",
              height: "fit-content",
              minHeight: "20px",
              "& > .typed-cursor": {
                lineHeight: "20px",
              },
            }}
          >
            <pre
              ref={activeElementRef}
              style={{
                margin: 0,
                lineHeight: "1.25rem",
                display: "inline",
                wordWrap: "break-word",
                whiteSpace: "break-spaces",
              }}
            />
          </div>
        )}
      </div>
    </Box>
  );
}
