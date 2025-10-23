import { css } from "@emotion/react";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";
import { Typography } from "@mui/material";
import Box from "@mui/material/Box";
import { SimpleTreeView } from "@mui/x-tree-view/SimpleTreeView";
import { treeItemClasses } from "@mui/x-tree-view/TreeItem";
import { useGetDrawerContent } from "../../hooks/useGetDrawerContent";
import { TreeItem } from "../TreeItem";
import { StepNavButtons } from "./StepNavButtons";
import type { Tours } from "../../utils/drawerTypes";
import { SubStep as SubStepTreeItem } from "./Steps/SubStep";
import type { SubStep } from "../../utils/drawerTypes";

const NavDrawerBodyStyles = css({
  padding: "8px 0",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  marginTop: "24px",
  marginBottom: "24px",
});

const BodyScrollContainer = css({
  maxHeight: `100%`,
  overflowY: "auto",
  overflowX: "hidden",
});

type BodyProps = {
  inTour: boolean;
  drawerItems: Tours;
  handleDrawerItemClick: (itemId: string) => void;
  expandedDrawerItems: string[];
};

// TODO: All borked, need fixed

export function Body({
  inTour,
  drawerItems,
  handleDrawerItemClick,
  expandedDrawerItems,
}: BodyProps) {
  return (
    <Box sx={css([BodyScrollContainer])}>
      {!inTour && (
        <Box sx={{ padding: "10px 4px 10px 8px" }}>
          <Typography>
            Ready to play? Select a use case and let's roll.
          </Typography>
        </Box>
      )}
      {/* <Box sx={css([NavDrawerBodyStyles])} className="drawer-body">
        <SimpleTreeView
          slots={{
            expandIcon: ArrowRightIcon,
            collapseIcon: ArrowDropDownIcon,
          }}
          expandedItems={expandedDrawerItems}
          onItemClick={handleDrawerItemClick}
        >
          {drawerItems.map(
            ({ itemId, label, content, slotProps, subSteps }) => (
              <TreeItem
                key={itemId}
                topLevel
                itemId={itemId}
                label={label}
                slotProps={slotProps}
              >
                {subSteps
                  ? subSteps.map((substep: SubStep) => (
                      <SubStepTreeItem {...substep} />
                    ))
                  : content}
                <StepNavButtons />
              </TreeItem>
            )
          )}
        </SimpleTreeView>
      </Box> */}
    </Box>
  );
}
