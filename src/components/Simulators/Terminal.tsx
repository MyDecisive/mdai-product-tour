import { Box } from "@mui/material";
import { useGetTerminalSimulatorContent } from "../../hooks/useGetTerminalSimulatorContent";
import {
  type SimulatorType,
  type TerminalTypedOptions,
} from "../../utils/types";

interface TerminalProps {
  state: TerminalTypedOptions[] | null | undefined;
  playing: boolean;
  onAnimationComplete: (sim?: SimulatorType) => void;
}

export function Terminal({
  state,
  playing,
  onAnimationComplete,
}: TerminalProps) {
  const { typedOptions, elementsRef, containerElementRef } =
    useGetTerminalSimulatorContent({
      state,
      playing,
      onAnimationComplete,
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
          minHeight: "100%",
        }}
      >
        {typedOptions.map((_, index) => (
          <div
            key={index}
            style={{
              display: "flex",
              alignItems: "flex-end",
              lineHeight: "1.5em",
            }}
          >
            <pre
              ref={(el) => {
                elementsRef.current[index] = el;
              }}
              style={{
                margin: 0,
                lineHeight: "1.5em",
                display: "inline",
                wordWrap: "break-word",
                whiteSpace: "break-spaces",
              }}
            />
          </div>
        ))}
      </div>
    </Box>
  );
}
