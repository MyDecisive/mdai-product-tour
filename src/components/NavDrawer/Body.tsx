import { css } from "@emotion/react";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";
import Box from "@mui/material/Box";
import { SimpleTreeView } from "@mui/x-tree-view/SimpleTreeView";
import { useGetDrawerContent } from "../../hooks/useGetDrawerContent";
import type { StepItem, TourSelectionItem } from "../../utils/types";
import { StepWithSubSteps } from "./Steps/StepWithSubSteps";
import { TourSelect } from "./Steps/TourSelect";

const NavDrawerBodyStyles = css({
  padding: "8px 0",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  marginTop: "24px",
  marginBottom: "24px",
});

export const subLabelStyles = css({
  color: "#8A38F5",
  fontStyle: "italic",
  fontFamily: "Inter",
});

const BodyScrollContainer = css({
  maxHeight: `100%`,
  overflowY: "auto",
  overflowX: "hidden",
});

export function Body() {
  const { inTour, drawerItems, expandedDrawerItemIds, handleTreeItemClick } =
    useGetDrawerContent();

  return (
    <Box sx={css([BodyScrollContainer])}>
      <Box sx={css([NavDrawerBodyStyles])} className="drawer-body">
        <SimpleTreeView
          slots={{
            expandIcon: ArrowRightIcon,
            collapseIcon: ArrowDropDownIcon,
          }}
          expandedItems={expandedDrawerItemIds}
          onItemClick={handleTreeItemClick}
        >
          {drawerItems &&
            (inTour
              ? drawerItems.map((item) => (
                  <StepWithSubSteps key={item.id} {...(item as StepItem)} />
                ))
              : drawerItems.map((item) => (
                  <TourSelect key={item.id} {...(item as TourSelectionItem)} />
                )))}
        </SimpleTreeView>
      </Box>
    </Box>
  );
}
