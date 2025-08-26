import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";
import Box from "@mui/material/Box";
import { SimpleTreeView } from "@mui/x-tree-view/SimpleTreeView";

import { css } from "@emotion/react";
import { DLF } from "../constants";
import type { View } from "../types";
import { DLFViewContent } from "./DLFViewContent";
import { HomeViewContent } from "./HomeViewContent";

type BodyProps = {
  view?: View;
  step?: string;
  setView: (view?: View) => void;
};

const NavDrawerBodyStyles = css({
  padding: "8px 0",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  marginTop: "24px",
  marginBottom: "24px",
});

const HEADER_HEIGHT = 65;
const FOOTER_HEIGHT = 80;

const BodyScrollContainer = css({
  maxHeight: `calc(100% - ${HEADER_HEIGHT + FOOTER_HEIGHT}px)`,
  overflowY: "auto",
});

export function Body({ view, setView }: BodyProps) {
  return (
    <Box sx={css([BodyScrollContainer])}>
      <Box sx={css([NavDrawerBodyStyles])} className="drawer-body">
        <SimpleTreeView
          slots={{
            expandIcon: ArrowRightIcon,
            collapseIcon: ArrowDropDownIcon,
          }}
        >
          {!view && <HomeViewContent onStartTour={setView} />}
          {view === DLF && <DLFViewContent />}
        </SimpleTreeView>
      </Box>
    </Box>
  );
}
