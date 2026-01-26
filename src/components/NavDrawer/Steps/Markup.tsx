import { css } from "@emotion/react";
import { Box, Button, Typography } from "@mui/material";
import React from "react";
import type { AnyFrame } from "../../../types/frames";
import type { Simulator } from "../../../types/kinds";
import type { ContentItem } from "../../../types/steps";

const InlineButtonStyles = css({
  padding: 0,
  textTransform: "none",
  lineHeight: "24px",
  fontWeight: 400,
  fontSize: "1rem",
  minWidth: 0,
});

interface MarkupProps {
  text: string;
  actions?: ContentItem["actions"];
  activeSimulator: Set<Simulator>;
  onTriggerFrame: (frame: AnyFrame) => void;
}

export function MarkupText({
  text,
  actions = [],
  activeSimulator,
  onTriggerFrame,
}: MarkupProps) {
  const handleActionClick = (actionIndex: number) => {
    const action = actions[actionIndex];
    if (!action) {
      console.warn(`No action at index ${actionIndex}`);
      return;
    }
    console.log("action ", action);
    onTriggerFrame(action);
  };

  return <>{parseAndRender(text, activeSimulator, handleActionClick)}</>;
}

function parseAndRender(
  text: string,
  activeSimulator: Set<Simulator>,
  handleActionClick: (index: number) => void,
): React.ReactNode {
  const segments: React.ReactNode[] = [];

  const patterns = [
    {
      // <button:0>text</button>
      regex: /<button:(\d+)>([^<]+)<\/button>/g,
      render: (match: RegExpMatchArray, key: number) => {
        const actionIndex = parseInt(match[1], 10);
        const content = match[2];
        return (
          <Button
            key={key}
            variant="text"
            onClick={() => handleActionClick(actionIndex)}
            sx={InlineButtonStyles}
          >
            {content}
          </Button>
        );
      },
    },
    // {
    //   // <link:0>text</link>
    //   regex: /<link:(\d+)>([^<]+)<\/link>/g,
    //   render: (match: RegExpMatchArray, key: number) => {
    //     const actionIndex = parseInt(match[1], 10);
    //     const content = match[2];
    //     return (
    //       <Typography
    //         key={key}
    //         component="span"
    //         onClick={() => handleActionClick(actionIndex)}
    //         sx={{
    //           color: "#B062C2",
    //           cursor: "pointer",
    //           textDecoration: "underline",
    //           "&:hover": { color: "#EA80FC" },
    //         }}
    //       >
    //         {content}
    //       </Typography>
    //     );
    //   },
    // },
    {
      // <highlight:simulator>text</highlight>
      regex: /<highlight:(\w+)>([^<]+)<\/highlight>/g,
      render: (match: RegExpMatchArray, key: number) => {
        const simulator = match[1] as Simulator;
        const content = match[2];
        const isActive = activeSimulator.has(simulator);
        return (
          <span
            key={key}
            style={{
              fontWeight: 700,
              color: isActive ? "#EA80FC" : "inherit",
            }}
          >
            {content}
          </span>
        );
      },
    },
    {
      // <code>text</code>
      regex: /<code>([^<]+)<\/code>/g,
      render: (match: RegExpMatchArray, key: number) => (
        <Box sx={{ overflowX: "auto" }}>
          <pre
            key={key}
            style={{
              color: "#83ACDE",
            }}
          >
            {match[1]}
          </pre>
        </Box>
      ),
    },
    {
      // <bold>text</bold>
      regex: /<bold>([^<]+)<\/bold>/g,
      render: (match: RegExpMatchArray, key: number) => (
        <span style={{ fontWeight: 700 }} key={key}>
          {match[1]}
        </span>
      ),
    },
    {
      // <emphasize>text</emphasize>
      regex: /<emphasize>([^<]+)<\/emphasize>/g,
      render: (match: RegExpMatchArray, key: number) => (
        <span style={{ color: "#B062C2" }} key={key}>
          {match[1]}
        </span>
      ),
    },
  ];

  const remaining = text;
  let position = 0;
  let keyCounter = 0;

  while (position < remaining.length) {
    let earliestMatch: {
      index: number;
      match: RegExpMatchArray;
      render: (match: RegExpMatchArray, key: number) => React.ReactNode;
    } | null = null;

    for (const pattern of patterns) {
      pattern.regex.lastIndex = 0;
      const match = pattern.regex.exec(remaining.slice(position));

      if (
        match &&
        (earliestMatch === null || position + match.index < earliestMatch.index)
      ) {
        earliestMatch = {
          index: position + match.index,
          match,
          render: pattern.render,
        };
      }
    }

    if (earliestMatch) {
      if (earliestMatch.index > position) {
        segments.push(remaining.slice(position, earliestMatch.index));
      }

      segments.push(earliestMatch.render(earliestMatch.match, keyCounter++));
      position = earliestMatch.index + earliestMatch.match[0].length;
    } else {
      segments.push(remaining.slice(position));
      break;
    }
  }

  return (
    <Typography
      component="span"
      sx={{ display: "inline", whiteSpace: "pre-wrap" }}
    >
      {segments.map((segment, i) =>
        typeof segment === "string" ? (
          <React.Fragment key={i}>{segment}</React.Fragment>
        ) : (
          React.cloneElement(segment as React.ReactElement, { key: i })
        ),
      )}
    </Typography>
  );
}
