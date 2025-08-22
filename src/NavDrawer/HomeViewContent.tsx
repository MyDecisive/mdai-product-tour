import { css } from "@emotion/react";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { TreeItem } from "@mui/x-tree-view/TreeItem";
import { Fragment } from "react/jsx-runtime";

import { DLF, DTF, PII } from "../constants";
import type { View } from "../types";
import { getViewTitle } from "./content";
import { InfoBox } from "./InfoBox";
import {
  ComingSoonStyles,
  NavTreeItemStyles,
  PrimaryCTAButtonStyles,
} from "./styles";

type HomeViewContentProps = {
  onStartTour: (view: View) => void;
};

export function HomeViewContent({ onStartTour }: HomeViewContentProps) {
  return [
    {
      itemId: DLF,
      label: getViewTitle(DLF),
      content: (
        <InfoBox>
          <Typography>
            MDAI offers multiple solutions. Let’s explore{" "}
            <Typography
              component="span"
              sx={{ textDecoration: "underline", display: "inline" }}
            >
              Dynamic Log Filtering
            </Typography>{" "}
            now!
          </Typography>
          <br />
          <Typography>You can learn about it in 3 steps</Typography>
          <br />
          <div
            style={{ display: "flex", width: "100%", justifyContent: "center" }}
          >
            <Button
              sx={css([PrimaryCTAButtonStyles])}
              onClick={() => onStartTour(DLF)}
            >
              Start the Demo
            </Button>
          </div>
        </InfoBox>
      ),
    },
    {
      itemId: DTF,
      label: getViewTitle(DTF),
      content: "",
      comingSoon: true,
    },
    {
      itemId: PII,
      label: getViewTitle(PII),
      content: "",
      comingSoon: true,
    },
  ].map(({ itemId, label, content, comingSoon }) => (
    <Fragment key={itemId}>
      <TreeItem sx={css([NavTreeItemStyles])} itemId={itemId} label={label}>
        {content}
      </TreeItem>
      {comingSoon && (
        <Typography sx={css([ComingSoonStyles])}>Coming soon</Typography>
      )}
    </Fragment>
  ));
}
