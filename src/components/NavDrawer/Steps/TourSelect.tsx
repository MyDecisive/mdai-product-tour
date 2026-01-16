import { Button, Typography } from "@mui/material";
import { InfoBox } from "../../InfoBox";
import { TreeItem } from "../../TreeItem";
import type { TourSelectionItem } from "../../../types/steps";

export function TourSelect({
  itemId,
  title,
  comingSoon,
  subtitle,
  buttonText,
  onTourSelect,
}: TourSelectionItem) {
  return (
    <>
      <TreeItem
        topLevel
        itemId={itemId}
        label={title}
        slotProps={{
          label: {
            style: { textTransform: "uppercase" },
            ...(comingSoon ? { subLabel: subtitle } : {}),
          },
        }}
      >
        {!comingSoon && (
          <InfoBox>
            {subtitle && <Typography>{subtitle}</Typography>}
            {buttonText && (
              <>
                <br />
                <div
                  style={{
                    display: "flex",
                    width: "100%",
                    justifyContent: "center",
                  }}
                >
                  <Button size="medium" onClick={onTourSelect}>
                    {buttonText}
                  </Button>
                </div>
              </>
            )}
          </InfoBox>
        )}
      </TreeItem>
    </>
  );
}
