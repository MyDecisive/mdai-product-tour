import { Box, Link } from "@mui/material";
import { useCallback } from "react";
import type { ConfigContent } from "../../../types/player";
import { GapLine } from "./GapLine";
import { ToggleChangeButton } from "./ToggleChangeButton";

interface ConfigTabPanelProps {
  fileName: string;
  url: string | undefined;
  groups: ConfigContent[];
  pulsedGroups: Set<string>;
  groupsShowingChanges: Set<string>;
  groupsShowingToggle: Set<string>;
  toggleGroupShowingChange: (groupId: string) => void;
  active: boolean;
  changeMap: Map<number, string>;
  makeSetContainerRef: (
    fileName: string
  ) => (element: HTMLDivElement | null) => void;
}

export function ConfigTabPanel(props: ConfigTabPanelProps) {
  const {
    fileName,
    groups,
    pulsedGroups,
    url,
    toggleGroupShowingChange,
    groupsShowingChanges,
    groupsShowingToggle,
    active,
    changeMap,
    makeSetContainerRef,
  } = props;

  const makeToggleGroupShowingChange = useCallback(
    (groupId: string) => {
      return () => toggleGroupShowingChange(groupId);
    },
    [toggleGroupShowingChange]
  );

  return (
    <Box
      role="tabpanel"
      hidden={!active}
      id={`${fileName}-tabpanel`}
      aria-labelledby={`${fileName}-control-tab`}
      ref={makeSetContainerRef(fileName)}
      sx={{
        maxHeight: 300,
        overflowY: "auto",
        overflowX: "hidden",
        fontFamily:
          'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace',
        fontSize: 13,
        lineHeight: 1.5,
        scrollbarWidth: "thin",
        scrollbarColor: "#B062C2 transparent",
        position: "relative",
      }}
    >
      {url && (
        <Box
          sx={{
            position: "sticky",
            top: 0,
            right: 0,
            width: "100%",
            display: "flex",
            justifyContent: "flex-end",
            zIndex: 1,
          }}
        >
          <Link
            href={url}
            variant="body2"
            underline="hover"
            target="_blank"
            rel="noopener"
            sx={{
              background: "#00000059",
              px: "4px",
              borderRadius: "8px",
            }}
          >
            {`View this config in GitHub →`}
          </Link>
        </Box>
      )}
      {groups.map((group, groupIndex) => {
        if (group.kind === "gap") {
          return <GapLine key={`${fileName}-gap-${group.lineNo}`} {...group} />;
        }

        const prevGroup = groups[groupIndex - 1];
        const nextGroup = groups[groupIndex + 1];

        const showingChange = groupsShowingChanges.has(group.groupId);
        const showingToggle = groupsShowingToggle.has(group.groupId);
        const isChangeBlock = !!group.isChangeBlock;
        const pulsed = pulsedGroups.has(group.groupId);

        const gapUpTop = isChangeBlock && prevGroup?.kind === "gap";
        const gapDownBelow = isChangeBlock && nextGroup?.kind === "gap";

        return (
          <Box
            key={`group-${group.groupId}`}
            sx={{
              color: "var(--mdai-text-disabled)",
              ...(isChangeBlock && {
                outline: "2px solid #B062C2",
                outlineOffset: "-2px",
                borderRadius: "6px",
                position: "relative",
                my: 0.5,
              }),
              ...(gapUpTop && {
                mt: 1.5,
              }),
              ...(gapDownBelow && {
                mb: 1.5,
              }),
            }}
          >
            {isChangeBlock && showingToggle && (
              <ToggleChangeButton
                showingChange={showingChange}
                onClick={makeToggleGroupShowingChange(group.groupId)}
              />
            )}

            {group.lines.map((line) => {
              const highlight = changeMap.has(line.lineNo);
              return (
                <Box
                  key={`line-${line.lineNo}`}
                  data-line={line.lineNo}
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "40px 1fr",
                    gap: 1,
                    py: 0.25,
                    bgcolor: "transparent",
                    "@keyframes backgroundPulse": {
                      "0%": {
                        backgroundColor: "rgba(176, 98, 194, 0.6)",
                      },
                      "100%": { backgroundColor: "transparent" },
                    },
                    ...(pulsed && {
                      animation: "backgroundPulse 1s ease-out forwards",
                    }),
                    ...(highlight && { color: "text.primary" }),
                  }}
                >
                  <Box
                    sx={{
                      textAlign: "right",
                    }}
                  >
                    {showingChange
                      ? line.changeLineNo ?? line.lineNo
                      : line.lineNo}
                  </Box>
                  <Box component="pre" sx={{ m: 0, whiteSpace: "pre-wrap" }}>
                    {(showingChange
                      ? line.changeContent ?? line.content
                      : line.content) || "\u00A0"}
                  </Box>
                </Box>
              );
            })}
          </Box>
        );
      })}
    </Box>
  );
}
