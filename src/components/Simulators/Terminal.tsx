import { Box } from "@mui/material";
import { useGetTerminalSimulatorContent } from "../../hooks/useGetTerminalSimulatorContent";

export function Terminal() {
  const {
    typedOptions = [],
    elementsRef,
    containerElementRef,
  } = useGetTerminalSimulatorContent();

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
