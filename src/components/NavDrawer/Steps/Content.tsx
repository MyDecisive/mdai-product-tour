import { Box, List, ListItem, Typography } from "@mui/material";
import { useDemoContext } from "../../../hooks/useDemoContext";
import type { EngineContentBlock } from "../../../utils/engineTypesScratch";
import { MarkupText } from "./Markup";

const ListItemStyles: React.CSSProperties = {
  padding: 0,
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "flex-start",
};

const BulletStyle: React.CSSProperties = {
  fontWeight: 700,
  paddingLeft: "4px",
  paddingRight: "4px",
};

const TitleStyles: React.CSSProperties = {
  fontWeight: 700,
};

export function ContentBlock({ variant, title, items }: EngineContentBlock) {
  const { engineControls, engineState } = useDemoContext();

  const { onTriggerFrame } = engineControls;
  const { activeSimulator } = engineState;

  return (
    <Box
      sx={{
        borderRadius: "4px",
        padding: "8px 8px 8px 16px",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        cursor: "default",
      }}
    >
      {title && (
        <Typography sx={TitleStyles} component="span">
          {title}
        </Typography>
      )}
      <Typography component={"span"}>
        {variant === "list" ? (
          <List>
            {items.map(({ onClick, bullet, ...rest }, index) => (
              <ListItem
                key={index}
                sx={[
                  ListItemStyles,
                  { cursor: onClick ? "pointer" : "inherit" },
                ]}
                onClick={onClick && (() => onTriggerFrame(onClick))}
              >
                {bullet && <Typography sx={BulletStyle}>{bullet}</Typography>}
                <MarkupText
                  {...rest}
                  activeSimulator={activeSimulator}
                  onTriggerFrame={onTriggerFrame}
                />
              </ListItem>
            ))}
          </List>
        ) : (
          <>
            {items &&
              items.length > 0 &&
              items.map((item, index) => (
                <MarkupText
                  key={index}
                  {...item}
                  activeSimulator={activeSimulator}
                  onTriggerFrame={onTriggerFrame}
                />
              ))}
          </>
        )}
      </Typography>
    </Box>
  );
}
