import { Box, Button, Typography } from "@mui/material";
import { useDemoContext } from "../../../hooks/useDemoContext";
import type { ContentItem } from "../../../utils/drawerTypes";

export function Item({
  text,
  highlightText,
  variant,
  link,
  style,
}: ContentItem) {
  const { engineState } = useDemoContext();

  const handleAnchorClick = (linkString: string) => () => {
    if (
      linkString === "status" ||
      linkString === "config" ||
      linkString === "logs" ||
      linkString === "terminal"
    ) {
      const simBox = document.getElementById(`${linkString}`);
      if (simBox) {
        const element = simBox;
        const computedStyles = getComputedStyle(element);
        const oldTransition = computedStyles.transition;
        const oldBorderColor = computedStyles.borderColor;

        element.style.transition = "border-color 0.5s ease";
        element.style.borderColor = "#B062C2";

        setTimeout(() => {
          element.style.borderColor = oldBorderColor;
        }, 1000);
        setTimeout(() => {
          element.style.transition = oldTransition;
        }, 1500);
      } else {
        console.warn("No element with class 'status' found.");
      }
    } else {
      window.open(linkString, "_blank");
    }
  };

  switch (variant) {
    case "code": {
      return (
        <Box sx={{ overflowX: "auto" }}>
          <pre style={{ color: "#B062C2", margin: 0 }}>{text}</pre>
        </Box>
      );
    }

    case "button": {
      return (
        <Button
          onClick={handleAnchorClick(link ?? "")}
          variant="text"
          sx={{
            padding: 0,
            textTransform: "none",
            fontWeight: 400,
            fontSize: "1rem",
          }}
        >
          {text ?? ""}
        </Button>
      );
    }

    default: {
      return highlightText ? (
        <Typography sx={style}>
          <span
            style={{
              fontWeight: 700,
              ...(highlightText.simulator &&
                engineState.activeSimulator.has(highlightText.simulator) && {
                  color: "#000000",
                  backgroundColor: "#B062C2",
                }),
            }}
          >
            {highlightText.text}
          </span>
          {text}
        </Typography>
      ) : (
        <Typography sx={style}>{text}</Typography>
      );
    }
  }
}
