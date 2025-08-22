import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import Box from "@mui/material/Box";
import { SimpleTreeView } from "@mui/x-tree-view/SimpleTreeView";

import { css } from "@emotion/react";
import { DLF } from "../constants";
import type { View } from "../types";
import { DLFViewContent } from "./DLFViewContent";
import { HomeViewContent } from "./HomeViewContent";
import { NeedHelpButton } from "./NeedHelpButton";
import { NavDrawerBodyStyles, NavDrawerStyles } from "./styles";

type BodyProps = {
  view?: View;
  step?: string;
  setView: (view?: View) => void;
};

function RotatedChevron() {
  return <ArrowForwardIosIcon sx={{ transform: "rotate(90deg)" }} />;
}

export function Body({ view, setView }: BodyProps) {
  return (
    <Box sx={css([NavDrawerStyles, NavDrawerBodyStyles])}>
      <SimpleTreeView
        slots={{
          expandIcon: ArrowForwardIosIcon,
          collapseIcon: RotatedChevron,
        }}
      >
        {!view && <HomeViewContent onStartTour={setView} />}
        {view === DLF && <DLFViewContent />}
      </SimpleTreeView>
      <NeedHelpButton />
    </Box>
  );
}
