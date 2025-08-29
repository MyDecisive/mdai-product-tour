import Box from "@mui/material/Box";
import { useEffect, useMemo, useRef } from "react";

type Range = { 
    start: number; 
    end: number 
};

type ConfigTextProps = { 
    text?: string; 
    activeRange?: Range 
};

export function ConfigText({
  text,
  activeRange,
}: ConfigTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const lines = useMemo(() => (text ?? "").split("\n"), [text]);

  useEffect(() => {
    if (!activeRange) return;
    const el = containerRef.current?.querySelector<HTMLDivElement>(
      `[data-line="${activeRange.start}"]`
    );
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [activeRange]);

  return (
    <Box
      ref={containerRef}
      sx={{
        maxHeight: 350,
        overflow: "scroll",
        fontFamily:
          'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace',
        fontSize: 13,
        lineHeight: 1.5,
        scrollbarWidth: "thin",
        scrollbarColor: "#B062C2 transparent",
      }}
    >
      {lines.map((line, i) => {
        const lineNo = i + 1;
        const active =
          !!activeRange &&
          lineNo >= activeRange.start &&
          lineNo <= activeRange.end;
        return (
          <Box
            key={i}
            data-line={lineNo}
            sx={{
              display: "grid",
              gridTemplateColumns: "48px 1fr",
              gap: 1,
              px: 1.5,
              py: 0.25,
              transition: "background-color 300ms",
              bgcolor: active ? "#b062c265" : "transparent",
            }}
          >
            <Box sx={{ color: "text.disabled", textAlign: "right", pr: 1 }}>
              {lineNo}
            </Box>
            <Box component="pre" sx={{ m: 0, whiteSpace: "pre-wrap" }}>
              {line || "\u00A0"}
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}
