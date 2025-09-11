import { Box } from "@mui/material";
import { useGetTerminalSimulatorContent } from "../../hooks/useGetTerminalSimulatorContent";

export function Terminal() {
  const {
    typedOptions = [],
    promptElementsRef,
    elementsRef,
    className,
    containerElementRef,
  } = useGetTerminalSimulatorContent();

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        height: "100%",
        width: "100%",
        maxHeight: "3350px",
        overflowY: "auto",
        flex: 1,
      }}
      ref={containerElementRef}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
        }}
      >
        <div style={{ display: "inline", width: "100%" }} className={className}>
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
    </Box>
  );
}
