import { Box, IconButton, Link, Tab, Tabs } from "@mui/material";
import { useGetConfigSimulatorContent } from "../../hooks/useGetConfigSimulatorContent";

export function ConfigText() {
  const { activeTab, setActiveTab, tabContents } =
    useGetConfigSimulatorContent();

  const handleChange = (_: React.SyntheticEvent, newValue: string) => {
    setActiveTab(newValue);
  };

  return (
    <>
      {tabContents.map(({ title, href }) => {
        return href ? (
          <Link
            key={`${title}-${href}`}
            href={href}
            variant="body2"
            underline="hover"
            target="_blank"
            rel="noopener"
          >
            {`View ${title} Config in GitHub →`}
          </Link>
        ) : null;
      })}
      <Tabs value={activeTab} onChange={handleChange}>
        {tabContents.map(({ title }) => (
          <Tab
            key={title}
            label={title}
            value={title}
            aria-controls={`${title}-control-tab`}
          />
        ))}
      </Tabs>
      {tabContents.map(
        ({
          title,
          containerRef,
          textGroups,
          showToggleButtons,
          pulsedLines,
          toggleLineValue,
        }) => (
          <Box
            key={title}
            role="tabpanel"
            hidden={activeTab !== title}
            id={`${title}-tabpanel`}
            aria-labelledby={`${title}-control-tab`}
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
            {textGroups.map((group, groupIndex) => {
              const prevGroup = textGroups[groupIndex - 1];
              const nextGroup = textGroups[groupIndex + 1];

              const gapUpTop = group.isChangeBlock && prevGroup?.isGap;
              const gapDownBelow = group.isChangeBlock && nextGroup?.isGap;

              return (
                <Box
                  key={`group-${groupIndex}`}
                  sx={{
                    ...(group.isChangeBlock && {
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
                  {group.isChangeBlock && showToggleButtons && (
                    <IconButton
                      size="small"
                      onClick={() => {
                        toggleLineValue(
                          group.lines
                            .filter((line) => {
                              return !!line.newValue;
                            })
                            .map((line) => line.lineNo)
                        );
                      }}
                      sx={{
                        width: 20,
                        height: 20,
                        position: "absolute",
                        left: 0,
                        top: 0,
                      }}
                    >
                      {group.lines[0].showingNewValue ? "⟲" : "↻"}
                    </IconButton>
                  )}

                  {group.lines.map((line) => {
                    if (line.isGap) {
                      return (
                        <Box
                          key={`line-${line.lineNo}`}
                          data-line={line.lineNo}
                          sx={{
                            height: "1px",
                            boxShadow: "0 1px 0 rgba(176, 98, 194, 0.3)",
                            margin: "1px 0",
                            position: "relative",
                            "&::before": {
                              content: '""',
                              position: "absolute",
                              left: "-8px",
                              right: "-8px",
                              top: "-1px",
                              height: "2px",
                              background:
                                "linear-gradient(90deg, transparent, rgba(176, 98, 194, 0.3) 20%, rgba(176, 98, 194, 0.3) 80%, transparent)",
                            },
                          }}
                        ></Box>
                      );
                    }

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
                          ...(pulsedLines.has(line.lineNo) && {
                            animation: "backgroundPulse 1s ease-out forwards",
                          }),
                        }}
                      >
                        <Box
                          sx={{
                            color: "text.disabled",
                            textAlign: "right",
                          }}
                        >
                          {line.lineNo}
                        </Box>
                        <Box
                          component="pre"
                          sx={{ m: 0, whiteSpace: "pre-wrap" }}
                        >
                          {(line.showingNewValue
                            ? line.newValue
                            : line.content) || "\u00A0"}
                        </Box>
                      </Box>
                    );
                  })}
                </Box>
              );
            })}
          </Box>
        )
      )}
    </>
  );
}
