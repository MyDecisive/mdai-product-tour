import { Box } from "@mui/material";
import { useGetConfigSimulatorContent } from "../../hooks/useGetConfigSimulatorContent";
import { SimulatorContextLabel } from "./SimContextLabel";

export function ConfigText() {
  const { containerRef, title, processedLines } =
    useGetConfigSimulatorContent();

  return (
    <>
      <SimulatorContextLabel>{title}</SimulatorContextLabel>
      <Box
        ref={containerRef}
        sx={{
          maxHeight: 325,
          overflow: "scroll",
          fontFamily:
            'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace',
          fontSize: 13,
          lineHeight: 1.5,
          scrollbarWidth: "thin",
          scrollbarColor: "#B062C2 transparent",
        }}
      >
        {processedLines.map(({ lineNo, content, isHighlighted }) => {
          return (
            <Box
              key={lineNo}
              data-line={lineNo}
              sx={{
                display: "grid",
                gridTemplateColumns: "48px 1fr",
                gap: 1,
                px: 1.5,
                py: 0.25,
                transition: "background-color 300ms",
                bgcolor: isHighlighted ? "#b062c265" : "transparent",
              }}
            >
              <Box sx={{ color: "text.disabled", textAlign: "right", pr: 1 }}>
                {lineNo}
              </Box>
              <Box component="pre" sx={{ m: 0, whiteSpace: "pre-wrap" }}>
                {content || "\u00A0"}
              </Box>
            </Box>
          );
        })}
      </Box>
    </>
  );
}
