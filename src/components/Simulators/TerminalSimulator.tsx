import { Box, css, Typography } from "@mui/material";
import { useState } from "react";
import { ReactTyped } from "react-typed";

const TERMINAL_PROMPT = "eng@local-terminal > ";
const CURSOR_CHAR = "&block;";

const terminalAutoLines = [
  "<br/><br/>🧪 Deploying synthetic log generators...\ndeployment.apps/mdai-logger-xnoisy created\ndeployment.apps/mdai-logger-noisy created\ndeployment.apps/mdai-logger created\n✅ Log generators deployed",
];

const userEntry = [
  "./MDAI-kind",
  "./mdai-kind .sh",
  "./mdai-kind.sh kif",
  "./mdai-kind.sh logs",
];

const cursorStyles = css({
  opacity: 1,
  animation: "typedjsBlink 0.7s infinite",
  [`@keyframes typedjsBlink`]: {
    "50%": { opacity: "0.0" },
  },
});

export function Terminal() {
  const [runOutput, setRunOutput] = useState<boolean>(false);
  const [outputComplete, setOutputComplete] = useState<boolean>(false);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        height: "100%",
        flex: 1,
      }}
    >
      <Box
        sx={{
          display: "flex",
        }}
      >
        <span>
          <pre style={{ margin: 0, display: "inline" }}>
            {TERMINAL_PROMPT}
            {runOutput ? userEntry[3] : null}
          </pre>
        </span>
        <ReactTyped
          style={{ display: "inline" }}
          strings={userEntry}
          typeSpeed={70}
          backSpeed={150}
          cursorChar={CURSOR_CHAR}
          showCursor={!runOutput}
          stopped={runOutput}
          onComplete={() => {
            setRunOutput(true);
          }}
          loopCount={1}
        >
          <pre style={{ margin: 0, display: "inline" }}></pre>
        </ReactTyped>
      </Box>
      <ReactTyped
        style={{ display: "inline" }}
        strings={terminalAutoLines}
        startDelay={500}
        stopped={runOutput && outputComplete}
        onBegin={(t) => {
          !runOutput && t?.stop();
        }}
        typeSpeed={5}
        cursorChar={CURSOR_CHAR}
        showCursor={runOutput && !outputComplete}
        onComplete={() => setOutputComplete(true)}
      >
        <pre style={{ margin: 0, display: "inline" }}></pre>
      </ReactTyped>
      {runOutput && outputComplete && (
        <span>
          <pre
            style={{ margin: 0, display: "block" }}
            dangerouslySetInnerHTML={{ __html: terminalAutoLines[0] }}
          ></pre>
          <pre style={{ margin: 0, display: "inline" }}>{TERMINAL_PROMPT}</pre>
          <Typography
            component={"pre"}
            sx={css(
              {
                margin: 0,
                display: "inline",
                fontFamily: "system-ui, Avenir, Helvetica, Arial, sans-serif",
                unicodeBidi: "isolate",
                whiteSpace: "pre",
                marginBlock: "1em 1em",
                marginInline: 0,
              },
              cursorStyles
            )}
          >
            █
          </Typography>
        </span>
      )}
    </Box>
  );
}
