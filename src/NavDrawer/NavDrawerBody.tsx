import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import Box from "@mui/material/Box";
import { SimpleTreeView } from "@mui/x-tree-view/SimpleTreeView";
import { TreeItem } from "@mui/x-tree-view/TreeItem";
import { Fragment } from "react/jsx-runtime";

import { css } from "@emotion/react";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { DLF, DTF, PII } from "../constants";
import type { View } from "../types";
import { getViewTitle } from "./content";
import { InfoBox } from "./InfoBox";
import { NeedHelpButton } from "./NeedHelpButton";
import {
  ComingSoonStyles,
  NavDrawerBodyStyles,
  NavDrawerStyles,
  NavTreeItemStyles,
} from "./styles";

type NavDrawerBodyProps = {
  view?: View;
  step?: string;
  onClickNavItem: (view: View, step?: string) => void;
};

function RotatedChevron() {
  return <ArrowForwardIosIcon sx={{ transform: "rotate(90deg)" }} />;
}

// TODO: Create this in the component so props can be passed to the button
// maybe BodyContent components for each view?
const homeViewTreeData = [
  {
    itemId: DLF,
    label: getViewTitle(DLF),
    content: (
      <InfoBox>
        <Typography>
          MDAI offers multiple solutions. Let’s explore{" "}
          <Typography sx={{ textDecoration: "underline", display: "inline" }}>
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
            sx={{
              borderRadius: "12px",
              backgroundColor: "#B062C2",
              color: "black",
              fontWeight: 700,
              padding: "12px 36px",
            }}
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
];

export function NavDrawerBody(props: NavDrawerBodyProps) {
  return (
    <Box sx={css([NavDrawerStyles, NavDrawerBodyStyles])}>
      <SimpleTreeView
        slots={{
          expandIcon: ArrowForwardIosIcon,
          collapseIcon: RotatedChevron,
        }}
      >
        {homeViewTreeData.map(({ itemId, label, content, comingSoon }) => (
          <Fragment key={itemId}>
            <TreeItem
              sx={css([NavTreeItemStyles])}
              itemId={itemId}
              label={label}
            >
              <div>{content}</div>
            </TreeItem>
            {comingSoon && (
              <Typography sx={css([ComingSoonStyles])}>Coming soon</Typography>
            )}
          </Fragment>
        ))}
      </SimpleTreeView>
      <NeedHelpButton />
    </Box>
  );
}
